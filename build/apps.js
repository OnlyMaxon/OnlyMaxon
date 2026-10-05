/*
 * The pages an app needs to exist on the open web: the three Google Play demands, and the
 * one its sign-in emails point at.
 *
 * Called at the end of build/generate.js. Reads build/src/apps/<app>/<slug>.html — body
 * fragments, not whole pages — and writes:
 *
 *   apps/<app>/<slug>/index.html      the legal documents
 *   apps/<app>/auth/action[/index].html   the Firebase email-action handler
 *
 * Deliberately NOT part of the PAGES pipeline in generate.js, for the same reasons the
 * /u/ cards are not:
 *
 *   - One language. These are the binding text of an agreement between the app's operator
 *     and its users; a machine-assisted Turkish copy of a privacy policy is a liability,
 *     not a courtesy, because a mistranslated retention period is still a promise. The
 *     five-language key check would also block the build until every section existed in
 *     five languages, and the app's own interface is English.
 *   - noindex, and therefore no sitemap entry and no hreflang. These pages exist because
 *     Play Console demands three URLs, not because anyone should find them in search, and
 *     they carry a client's brand on this domain. Play's review fetches a URL directly;
 *     noindex does not hide a page from it. One line to reverse.
 *   - Their own ~2 KB stylesheet, no webfont, no script. The person opening the deletion
 *     page has usually already uninstalled the app and wants one instruction.
 *
 * The auth handler is the one exception to the no-script rule, and it has to be: it is the
 * page Firebase sends a password-reset or verification email to, and the work — exchanging
 * a one-time code with Firebase — can only happen in the browser. See authPage() below.
 *
 * The documents are yOdin's, so they keep yOdin's own look — the visitor arrives from the
 * app, and a legal notice that suddenly wears the studio's branding invites the one
 * question it must never raise: whose promise is this? The operator named inside them,
 * Jalil Orujli at hello@onlymaxon.com, is the same person who owns this domain, which is
 * what makes hosting them here correct rather than merely convenient.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://onlymaxon.com';
const DIR = 'apps';

const APPS = {
  yodin: {
    name: 'yOdin',
    /*
     * yOdin's palette, carried over verbatim from the pages this replaces. Both schemes are
     * declared because a legal document is read at whatever hour the reader happens to be
     * worried, and half of those phones are in dark mode.
     */
    theme: { light: '#ffffff', dark: '#0f0a1e' },
    /*
     * The Firebase web config for project yodin-23362, and the SDK build the handler pins.
     *
     * The apiKey is public by design: it names the project, it does not authorise anything,
     * and the identical string already ships inside the Android app where anyone can read
     * it. What protects an account is the one-time code in the email and Firebase's own
     * rules, not this. Only the three fields Auth actually reads are here — the database,
     * storage and messaging entries from the console are for products this page never
     * touches, and a config is a thing to keep minimal.
     *
     * The SDK version is pinned rather than floating: this page is the only way back into
     * an account for someone who has forgotten their password, so it must not be able to
     * change underneath us. 12.19.0 was the newest build on gstatic on 2026-10-04 and was
     * checked to export all four functions used below.
     */
    sdk: '12.19.0',
    firebase: {
      apiKey: 'AIzaSyCn9KppjnBOY0GrDiRMNIkqBxTPUebXl08',
      authDomain: 'yodin-23362.firebaseapp.com',
      projectId: 'yodin-23362',
    },
    css: `
  :root {
    --bg: #ffffff;
    --text: #18132a;
    --dim: #6b6385;
    --rule: #e2dcf3;
    --accent: #6c35de;
    --code-bg: #f4f1fc;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0f0a1e;
      --text: #f0ecf9;
      --dim: #9b8fc4;
      --rule: #2e2248;
      --accent: #a78bfa;
      --code-bg: #221a38;
    }
  }`,
    pages: [
      {
        slug: 'privacy',
        title: 'Privacy Policy — yOdin',
        desc: 'What personal data the yOdin app collects, who it is shared with, how long it is kept, and how to exercise your rights. No location, no analytics, no advertising identifiers.',
      },
      {
        slug: 'terms',
        title: 'Terms of Use — yOdin',
        desc: 'The agreement between you and the operator of the yOdin app: who may use it, what you may post, how moderation and blocking work, and what happens if the rules are broken.',
      },
      {
        slug: 'delete-account',
        title: 'Delete your yOdin account',
        desc: 'How to delete your yOdin account from inside the app or by email, exactly what is erased, and the few things that are kept afterwards and why.',
      },
    ],
  },
};

// The document's name for the nav, which wants a label rather than a headline: "Privacy
// policy" reads as one of three, "Privacy Policy for yOdin" reads as a mistake beside them.
const SHORT = {
  privacy: 'Privacy policy',
  terms: 'Terms of use',
  'delete-account': 'Delete your account',
};

/*
 * A markdown table is wider than a phone. The pages this replaces solved that with a script
 * that wrapped every table on load; done here instead, the scroll container is in the HTML
 * before the first paint and the pages carry no JavaScript at all.
 */
function wrapTables(html) {
  return html.replace(/<table>[\s\S]*?<\/table>/g, m => `<div class="table-wrap">\n${m}\n</div>`);
}

function page(app, meta, body) {
  const nav = app.pages
    .map(p => p.slug === meta.slug
      ? `<span aria-current="page">${SHORT[p.slug]}</span>`
      // Absolute, like every link inside the documents themselves: these pages are the
      // addresses a Play reviewer opens and an app links out to, and an absolute href
      // survives being mirrored, mailed or opened from a file:// copy.
      : `<a href="${SITE}/${DIR}/${app.key}/${p.slug}/">${SHORT[p.slug]}</a>`)
    .join('\n    ');

  return `<!DOCTYPE html>
<!--
  Generated by build/apps.js from build/src/apps/${app.key}/${meta.slug}.html.
  Editing this file does nothing: the next build overwrites it.
-->
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${meta.title}</title>
<meta name="description" content="${meta.desc}">
<link rel="canonical" href="${SITE}/${DIR}/${app.key}/${meta.slug}/">
<meta name="robots" content="noindex, follow">
<meta name="theme-color" content="${app.theme.light}" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="${app.theme.dark}" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/favicon.ico" sizes="any">
<style>${app.css}
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font: 16px/1.65 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  main { max-width: 46rem; margin: 0 auto; padding: 3rem 1.25rem 5rem; }
  h1 { font-size: 2rem; line-height: 1.15; letter-spacing: -.02em; margin: 0 0 1.5rem; }
  h2 { font-size: 1.25rem; margin: 2.5rem 0 .75rem; padding-top: 1.25rem; border-top: 1px solid var(--rule); }
  h3 { font-size: 1.0625rem; margin: 1.75rem 0 .5rem; }
  p, li { color: var(--text); }
  a { color: var(--accent); text-underline-offset: 2px; }
  strong { font-weight: 600; }
  hr { border: 0; border-top: 1px solid var(--rule); margin: 2.5rem 0; }
  /* Most sections open with an <hr> and then an <h2> that draws a rule of its own, so the
     old pages ruled every section twice, a centimetre apart. The heading yields. */
  hr + h2 { border-top: 0; padding-top: 0; margin-top: 0; }
  code {
    background: var(--code-bg);
    border: 1px solid var(--rule);
    border-radius: 4px;
    padding: .1em .35em;
    font-size: .875em;
    font-family: ui-monospace, "SF Mono", Menlo, monospace;
  }
  .table-wrap { overflow-x: auto; margin: 1.25rem 0; }
  table { border-collapse: collapse; width: 100%; font-size: .9375rem; }
  th, td { text-align: left; padding: .55rem .7rem; border-bottom: 1px solid var(--rule); vertical-align: top; }
  th { font-weight: 600; color: var(--dim); font-size: .8125rem; text-transform: uppercase; letter-spacing: .04em; }
  /* The three documents reference each other in prose, but not every pair: this is the one
     place all three are always one tap apart, which is what a Play reviewer needs. */
  .docnav { display: flex; flex-wrap: wrap; gap: .35rem 1.1rem; font-size: .875rem; margin: 0 0 2.5rem; color: var(--dim); }
  .docnav [aria-current] { color: var(--text); font-weight: 600; }
  footer { margin-top: 4rem; padding-top: 1.5rem; border-top: 1px solid var(--rule); color: var(--dim); font-size: .875rem; }
</style>
</head>
<body>
<main>
  <nav class="docnav">
    ${nav}
  </nav>
${body}
  <!-- The original footer linked the app's GitHub repository. It was dropped on 2026-10-04:
       the point of moving these documents here was that they stop depending on a personal
       account, and a legal page that sends the reader back to one argues against itself. -->
  <footer>${app.name} · Built by <a href="${SITE}/">OnlyMaxon</a></footer>
</main>
</body>
</html>
`;
}

/*
 * The page Firebase's own emails open: /apps/<app>/auth/action.
 *
 * Firebase appends ?mode=…&oobCode=… and the browser has to hand that one-time code back
 * to Firebase to finish the job. That is why this is the one page here with a script —
 * there is no server on this domain to do it, and the whole point of the exercise is that
 * the user never sees firebaseapp.com.
 *
 * Two things in here are load-bearing and easy to undo by accident:
 *
 *   - <meta name="referrer" content="no-referrer">. The one-time code sits in the URL, and
 *     loading the SDK is a cross-origin request. Browsers would send only the origin by
 *     default, but "no-referrer" means the code cannot leak in a Referer header even if a
 *     future browser or a future <img> on this page behaves differently.
 *   - Everything on screen is built with createElement and textContent, never innerHTML.
 *     Some of that text comes from Firebase (the account's email address), and a page that
 *     handles credentials is the last place to pass strings through an HTML parser.
 *
 * The error text is deliberately plain English. Expired and already-used codes are not an
 * edge case here — they are the single most common thing that happens to a link that sat
 * in an inbox for a day — so "auth/expired-action-code" must never reach a human.
 */
function authPage(app) {
  const sdk = v => `https://www.gstatic.com/firebasejs/${app.sdk}/firebase-${v}.js`;

  return `<!DOCTYPE html>
<!--
  Generated by build/apps.js. Editing this file does nothing: the next build overwrites it.

  This address is configured in Firebase Console → Authentication → Templates → Action URL
  for project ${app.firebase.projectId}. If this page 404s, password reset and email
  verification are broken for every user of the app.
-->
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${app.name} — account</title>
<meta name="robots" content="noindex, nofollow">
<meta name="referrer" content="no-referrer">
<meta name="theme-color" content="#F3F0FB" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0F0A1E" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/favicon.ico" sizes="any">
<style>
  :root {
    --bg: #F3F0FB;
    --text: #18132A;
    --muted: #6B6385;
    --card: #FFFFFF;
    --brand: #6C35DE;
    --on-brand: #FFFFFF;
    --line: #E2DCF3;
    --bad: #B3261E;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0F0A1E;
      --text: #F0ECF9;
      --muted: #9B8FC4;
      --card: #1C1530;
      --brand: #8B5CF6;
      --on-brand: #140B26;
      --line: #2E2248;
      --bad: #F2B8B5;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100dvh;
    display: grid;
    place-items: center;
    padding: 24px 16px;
    background: var(--bg);
    color: var(--text);
    font: 16px/1.6 Inter, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .card {
    width: 100%;
    max-width: 26rem;
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 22px;
    padding: 28px 24px 26px;
    box-shadow: 0 18px 40px rgba(24, 19, 42, .07);
  }
  @media (prefers-color-scheme: dark) { .card { box-shadow: none; } }
  .brand { font-weight: 700; font-size: 1.0625rem; letter-spacing: -.02em; color: var(--brand); margin: 0 0 20px; }
  h1 { font-size: 1.3125rem; line-height: 1.25; letter-spacing: -.015em; margin: 0 0 .5rem; }
  p { margin: 0 0 .25rem; }
  .muted { color: var(--muted); }
  .bad { color: var(--bad); }
  label { display: block; font-size: .875rem; font-weight: 600; margin: 1rem 0 .35rem; }
  input {
    width: 100%;
    /* 16px exactly: anything smaller and iOS Safari zooms the page on focus. */
    font: 16px/1.4 inherit;
    color: var(--text);
    background: transparent;
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: .7rem .8rem;
  }
  input:focus-visible { outline: 2px solid var(--brand); outline-offset: 1px; border-color: transparent; }
  button {
    width: 100%;
    margin-top: 1.25rem;
    font: 600 16px/1 inherit;
    color: var(--on-brand);
    background: var(--brand);
    border: 0;
    border-radius: 12px;
    padding: .9rem;
    cursor: pointer;
  }
  button:disabled { opacity: .55; cursor: default; }
  .spinner {
    width: 22px; height: 22px; margin: 2px 0 14px;
    border: 2px solid var(--line);
    border-top-color: var(--brand);
    border-radius: 50%;
    animation: spin .8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { .spinner { animation: none; } }
</style>
</head>
<body>
<main class="card">
  <p class="brand">${app.name}</p>
  <div id="view">
    <div class="spinner" aria-hidden="true"></div>
    <p class="muted">Checking your link…</p>
  </div>
  <noscript>
    <p class="muted">This page needs JavaScript to finish checking your link. Please open it
    in a normal browser window.</p>
  </noscript>
</main>
<script type="module">
import { initializeApp } from '${sdk('app')}';
import { getAuth, verifyPasswordResetCode, confirmPasswordReset, applyActionCode, checkActionCode }
  from '${sdk('auth')}';

const auth = getAuth(initializeApp(${JSON.stringify(app.firebase, null, 2).replace(/\n/g, '\n  ')}));

const view = document.getElementById('view');
const params = new URLSearchParams(location.search);
const mode = params.get('mode');
const code = params.get('oobCode');

const MESSAGES = {
  'auth/expired-action-code': 'This link has expired. Request a new one in the app.',
  'auth/invalid-action-code': 'This link is not valid or has already been used.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'This account no longer exists.',
  // Not in the brief, but the server rejects short passwords and "Something went wrong"
  // would leave the user with nothing to act on.
  'auth/weak-password': 'Please choose a password of at least 6 characters.'
};
const explain = e => MESSAGES[e && e.code] || 'Something went wrong. Please try again.';

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};
const show = (title, body, cls) => {
  view.replaceChildren(el('h1', null, title), el('p', cls || 'muted', body));
};

function passwordForm(email) {
  const form = el('form');
  const problem = el('p', 'bad');
  problem.hidden = true;

  const field = (id, label) => {
    const l = el('label', null, label);
    l.htmlFor = id;
    const i = el('input');
    i.id = id;
    i.type = 'password';
    i.required = true;
    i.minLength = 6;
    i.autocomplete = 'new-password';
    form.append(l, i);
    return i;
  };

  const head = el('h1', null, 'Set a new password');
  const who = el('p', 'muted', email ? 'For ' + email : 'Choose a password of at least 6 characters.');
  const first = field('pw1', 'New password');
  const again = field('pw2', 'Repeat password');
  const submit = el('button', null, 'Set new password');
  submit.type = 'submit';
  form.append(problem, submit);

  form.addEventListener('submit', async event => {
    event.preventDefault();
    problem.hidden = true;
    if (first.value.length < 6) return fail('Password must be at least 6 characters.');
    if (first.value !== again.value) return fail('The two passwords do not match.');

    submit.disabled = true;
    submit.textContent = 'Saving…';
    try {
      await confirmPasswordReset(auth, code, first.value);
      show('Password updated', 'Open ${app.name} and sign in with your new password.');
    } catch (e) {
      submit.disabled = false;
      submit.textContent = 'Set new password';
      fail(explain(e));
    }
  });

  function fail(text) {
    problem.textContent = text;
    problem.hidden = false;
  }

  view.replaceChildren(head, who, form);
}

async function run() {
  if (!mode || !code) {
    return show('Invalid link',
      'This address is missing the information ${app.name} needs. Open the link from the email again.');
  }
  try {
    if (mode === 'resetPassword') {
      return passwordForm(await verifyPasswordResetCode(auth, code));
    }
    if (mode === 'verifyEmail') {
      await applyActionCode(auth, code);
      return show('Email confirmed',
        'Go back to the ${app.name} app and tap “I’ve verified — continue”.');
    }
    if (mode === 'recoverEmail') {
      await checkActionCode(auth, code);
      await applyActionCode(auth, code);
      return show('Email restored', 'Your email address has been restored.');
    }
    return show('Invalid link', '${app.name} does not recognise this kind of link.');
  } catch (e) {
    show('This link did not work', explain(e), 'bad');
  }
}

run();
</script>
</body>
</html>
`;
}

function emit(file, html) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const before = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  fs.writeFileSync(file, html);
  return {
    rel: path.relative(ROOT, file).replace(/\\/g, '/'),
    kb: (html.length / 1024).toFixed(1),
    state: before === html ? '' : before === null ? '   ← new' : '   ← changed',
  };
}

function build() {
  console.log('app pages (build/apps.js)');

  for (const [key, app] of Object.entries(APPS)) {
    app.key = key;

    for (const meta of app.pages) {
      const src = path.join(ROOT, 'build', 'src', 'apps', key, `${meta.slug}.html`);
      const body = wrapTables(fs.readFileSync(src, 'utf8'));
      const r = emit(path.join(ROOT, DIR, key, meta.slug, 'index.html'), page(app, meta, body));
      console.log(`  ${r.rel}`.padEnd(40) + `${r.kb} KB   noindex${r.state}`);
    }

    if (!app.firebase) continue;

    /*
     * The same page written twice, on purpose.
     *
     * Firebase is configured with the extensionless address .../auth/action, and GitHub
     * Pages resolves that in two different ways depending on which file exists: action.html
     * is served directly with a 200, while action/index.html answers with a 301 to the
     * trailing-slash form. The redirect would almost certainly be fine — Pages carries the
     * query string across it — but "almost certainly" is the wrong standard for the only
     * route back into an account for a user who has forgotten their password. With both
     * files present, every spelling of the address answers 200 on the first request.
     * Once the live behaviour has been seen, one of the two can go.
     */
    const html = authPage(app);
    for (const file of [
      path.join(ROOT, DIR, key, 'auth', 'action', 'index.html'),
      path.join(ROOT, DIR, key, 'auth', 'action.html'),
    ]) {
      const r = emit(file, html);
      console.log(`  ${r.rel}`.padEnd(40) + `${r.kb} KB   noindex, Firebase SDK ${app.sdk}${r.state}`);
    }
  }
}

module.exports = { build };
