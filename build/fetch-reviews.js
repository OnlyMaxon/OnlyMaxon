/*
 * Pulls every Google review of the OnlyMaxon profile into build/reviews.json.
 *
 *   node build/fetch-reviews.js
 *
 * Places API was the obvious route and it is the wrong one: it returns at most 5 reviews
 * and picks them itself. This uses the Business Profile API, which returns the profile's
 * reviews in full — the price being that Google has to grant access to it first.
 *
 * Needs four env vars (GitHub Actions secrets in CI):
 *
 *   GOOGLE_CLIENT_ID       OAuth client, type "Web application"
 *   GOOGLE_CLIENT_SECRET
 *   GOOGLE_REFRESH_TOKEN   obtained once, by hand, with scope
 *                          https://www.googleapis.com/auth/business.manage
 *   GBP_LOCATION           optional; "accounts/123/locations/456". Discovered automatically
 *                          when absent, which costs two extra calls and only works when the
 *                          account has exactly one location.
 *
 * Two traps worth knowing before debugging this at midnight:
 *
 *   1. Reviews live in the *old* v4 API. The newer split APIs (Account Management,
 *      Business Information) never got a reviews method, so mybusiness.googleapis.com/v4
 *      is not legacy cruft here, it is the only door.
 *   2. A refresh token issued while the OAuth consent screen is still in "Testing" expires
 *      after 7 days. The cron works for a week and then dies quietly. Publish the app to
 *      "In production" and re-issue the token.
 */

const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'reviews.json');
const STARS = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

const die = msg => { console.error('\n  ERROR: ' + msg + '\n'); process.exit(1); };

/*
 * Waiting for the allowlist is not a failure.
 *
 * Access to the v4 API is granted by hand by Google, and the wait is measured in business
 * days. Until it lands every call comes back 403 SERVICE_DISABLED — which is the correct
 * answer to the question being asked, not a broken build. Exiting 1 on it would paint the
 * Actions tab red every morning for a fortnight, and a cron that cries wolf daily is one
 * you stop reading right before the day it has something to say.
 */
const notYetAllowlisted = body =>
  /SERVICE_DISABLED|has not been used in project|accessNotConfigured/.test(body);

async function api(url, token) {
  const res = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
  const body = await res.text();
  if (res.status === 403 && notYetAllowlisted(body)) {
    console.log('\n  Business Profile API access has not been granted to this project yet.');
    console.log('  Nothing to do until it is — the credentials themselves are fine, or this');
    console.log('  request would have failed at the token, not at the endpoint.');
    console.log('\n  Check https://console.cloud.google.com/iam-admin/quotas — 0 QPM means');
    console.log('  still queued, 300 QPM means granted and the next run will pick it up.\n');
    process.exit(0);
  }
  if (!res.ok) die(`${res.status} ${res.statusText} on ${url}\n  ${body.slice(0, 600)}`);
  return JSON.parse(body);
}

// An access token lasts an hour, which is longer than this script will ever run.
async function accessToken() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN)
    die('GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REFRESH_TOKEN must all be set');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  const body = await res.json();
  if (!res.ok) {
    // invalid_grant is almost always the 7-day Testing expiry, not a typo in the token.
    const hint = body.error === 'invalid_grant'
      ? '\n  invalid_grant usually means the refresh token expired because the OAuth' +
        '\n  consent screen is still in "Testing". Publish it, then issue a new token.'
      : '';
    die(`token refresh failed: ${JSON.stringify(body)}${hint}`);
  }
  return body.access_token;
}

// "accounts/123/locations/456" — the only identifier the reviews endpoint accepts.
async function findLocation(token) {
  if (process.env.GBP_LOCATION) return process.env.GBP_LOCATION;

  const accounts = (await api(
    'https://mybusinessaccountmanagement.googleapis.com/v1/accounts', token)).accounts || [];
  if (!accounts.length) die('the authorised Google account manages no Business Profiles');

  for (const acc of accounts) {
    const locs = (await api(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${acc.name}/locations` +
      `?readMask=name,title&pageSize=100`, token)).locations || [];
    if (locs.length === 1) {
      console.log(`  location: ${locs[0].title} (${acc.name}/${locs[0].name})`);
      return `${acc.name}/${locs[0].name}`;
    }
    if (locs.length > 1) {
      console.error('\n  More than one location on ' + acc.name + '. Set GBP_LOCATION to one of:');
      for (const l of locs) console.error(`    ${acc.name}/${l.name}   ${l.title}`);
      process.exit(1);
    }
  }
  die('no locations found on any account');
}

/*
 * Full name to "Firstname L." — the form Google itself shows in collapsed listings.
 * These are real people whose words end up on a commercial page; the surname adds
 * nothing a visitor needs and the link to their Google profile is right there anyway.
 * A name that is already a single word, or already abbreviated, is left untouched.
 */
function shorten(name) {
  const parts = (name || '').trim().split(/\s+/);
  if (parts.length < 2) return name;
  const last = parts[parts.length - 1];
  if (last.length <= 2 || last.endsWith('.')) return name;
  return parts.slice(0, -1).join(' ') + ' ' + [...last][0] + '.';
}

(async () => {
  const token = await accessToken();
  const location = await findLocation(token);

  // Paged, 50 at a time. A profile with 11 reviews finishes on the first page; this is
  // here so it keeps working at 300 without anyone remembering to come back to it.
  const collected = [];
  let pageToken = '', rating = null, total = 0;
  do {
    const page = await api(
      `https://mybusiness.googleapis.com/v4/${location}/reviews?pageSize=50` +
      (pageToken ? `&pageToken=${pageToken}` : ''), token);
    collected.push(...(page.reviews || []));
    rating = page.averageRating ?? rating;
    total = page.totalReviewCount ?? total;
    pageToken = page.nextPageToken || '';
  } while (pageToken);

  const reviews = collected
    // A star rating with no words is not something to show; it renders as an empty card.
    .filter(r => r.comment && r.comment.trim())
    .map(r => ({
      author: shorten(r.reviewer?.displayName || ''),
      rating: STARS[r.starRating] || 0,
      time: (r.createTime || '').slice(0, 10),
      text: r.comment.trim(),
      lang: '',
    }))
    .filter(r => r.author && r.rating)
    .sort((a, b) => b.time.localeCompare(a.time));

  // placeId and profileUrl are configuration, not data — the API does not return them and
  // overwriting the file wholesale would silently drop the link the page points at.
  const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
  const next = {
    ...prev,
    rating: rating != null ? Number(rating.toFixed(1)) : prev.rating,
    total: total || reviews.length,
    updated: new Date().toISOString().slice(0, 10),
    reviews,
  };

  /*
   * Nothing new? Leave the file alone, including `updated`.
   *
   * The caller decides whether to rebuild by asking git whether this file moved, and a
   * rebuild rewrites sitemap.xml with today's date. Bumping `updated` on every run would
   * therefore produce a commit every single morning that says a review changed when none
   * did — and a changelog that cries wolf daily is one nobody reads.
   */
  const same = JSON.stringify({ r: prev.reviews, a: prev.rating, t: prev.total })
            === JSON.stringify({ r: next.reviews, a: next.rating, t: next.total });
  if (same) {
    console.log(`  ${reviews.length} reviews, unchanged since ${prev.updated || 'last run'} — file untouched.`);
    return;
  }

  fs.writeFileSync(OUT, JSON.stringify(next, null, 2) + '\n');
  console.log(`  ${reviews.length} reviews with text (of ${next.total} total), ` +
              `average ${next.rating} → build/reviews.json`);
  console.log('\n  now run: node build/generate.js\n');
})().catch(e => die(e.stack || e.message));
