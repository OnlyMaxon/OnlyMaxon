/*
 * The front door of apps/yodin/ — the one page in that directory meant to be found.
 *
 * Everything else under apps/ is built by build/apps.js and is noindex on purpose: those
 * are the documents Google Play demands, written for a reviewer and for a user who already
 * has the app. This file writes the opposite kind of page — the one a stranger should land
 * on from a search for the app by name — and so it inverts almost every choice apps.js
 * makes: indexed, in a sitemap, with Open Graph, structured data, images and a webfont.
 *
 * Two generators write into one directory, which is worth stating plainly in both places
 * rather than leaving someone to discover it. apps.js owns apps/yodin/<document>/ and
 * apps/yodin/auth/; this file owns apps/yodin/index.html and sitemap-apps.xml. Neither
 * deletes anything, so they cannot collide.
 *
 *   WHY A SUBFOLDER AND NOT A DOMAIN. yodin.com is held by a squatter and the country
 *   domains are wrong for an app whose whole point is that its users are not in their own
 *   country. A subfolder inherits this domain's age and authority and is indexed far
 *   sooner than a new one. If a short brand domain is ever bought, the move is 301s from
 *   apps/yodin/* and the accumulated weight travels with them.
 *
 *   WHY ENGLISH ONLY. The app's own interface is localised into 27 languages, but its
 *   brand and store listing are English, and a landing page that disagrees with the store
 *   listing is the thing Play review notices. One language also means one canonical and no
 *   hreflang set to keep in step with the 14-page pipeline in generate.js.
 *
 *   WHY NO ANALYTICS. Decided with the owner on 2026-10-11. Nothing to consent to, no
 *   cookie banner, nothing to add to a privacy policy that currently says the app collects
 *   no analytics at all — and the impressions and positions this page exists to earn are
 *   reported by Search Console without a line of script.
 *
 *   WHY THE COPY LIVES HERE AND NOT IN build/src. The legal pages are ports of markdown
 *   held in the app's own repository, so they are read from build/src/apps/yodin/*.html as
 *   fragments and compared against their source character by character. This page has no
 *   upstream source to be faithful to: its copy is structure — a headline, five features,
 *   a FAQ — and splitting it from the markup that arranges it would only mean editing two
 *   files to change one sentence.
 *
 * EVERY CLAIM ON THIS PAGE WAS CHECKED AGAINST D:\VS\yOdin BEFORE IT WAS WRITTEN, because
 * Play policy treats a store listing and the site it links to as one description, and a
 * feature promised here but missing from the app is a rejection waiting to happen. The
 * counts in the copy — 27 languages, 45 countries, Android 7.0 — come from src/locales/,
 * src/data/countries.ts and the minSdkVersion in the release manifest, not from memory.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://onlymaxon.com';
const HERE = `${SITE}/apps/yodin/`;
const PLAY = 'https://play.google.com/store/apps/details?id=app.yodin';

const TITLE = 'yOdin — find your people abroad';
const DESC =
  'A free Android app for people living far from home: the news, events and places of ' +
  'the city you moved to, filtered to the community you came from. 27 languages, no ads.';

/*
 * The four categories a post can carry, with the colours the app paints them in
 * (src/theme/colors.ts). The labels are the ones on the chips in the app, not the internal
 * keys — a visitor comparing the page with the screenshots should read the same words, so
 * the `places` category appears here as "Worth Visiting", which is what it says on screen.
 */
const CATEGORIES = [
  ['News', '#4F46E5'],
  ['Events', '#FF6B6B'],
  ['Worth Visiting', '#10B981'],
  ['Lifestyle', '#F59E0B'],
];

/*
 * Three of the four Play Store screenshots, cropped to the device and nothing else.
 * The originals are marketing cards: a headline sits above the phone, baked into the
 * pixels. Text in an image is invisible to a crawler and to a screen reader, so the phone
 * is cut out and the headline set as real HTML — the same words, now actually readable.
 * The fourth original shows the sign-in screen and is left out: a login wall is a poor
 * argument for installing anything.
 *
 * THE CORNERS ARE TRANSPARENT, AND THEY HAVE TO BE. The phone in the original has rounded
 * corners, so a plain rectangular crop leaves four squares of the marketing card's own
 * violet — #7545DD, opaque — sitting outside them. That violet does not match the gradient
 * on this page at the same point, so the corners read as four sharp blocks. They are cut
 * with a rounded-rectangle alpha mask at the device's own 45px radius, and the crop takes
 * a pixel off each side as well, because the outermost row of a crop made at the device's
 * edge is still half-blended with that violet and would otherwise leave a faint halo.
 * The mask is geometric rather than a colour key on purpose: the app's own interface is
 * full of nearly the same violet, and keying by colour would punch holes in its buttons.
 *
 * Dimensions are declared on every <img> so nothing reflows once they arrive. If these
 * files are ever regenerated, re-check the corners over a contrasting colour, not over
 * the page — on violet, a violet fringe is invisible right up until the day it isn't.
 */
const SHOT = { w: 662, h: 1296 };

const FEATURES = [
  {
    h: 'Filter by nationality',
    img: 'screen-nationality',
    alt: 'The yOdin nationality filter open over the feed, with a searchable list of countries',
    p: [
      'A feed from the city you live in is only worth reading if it is about your life in ' +
      'it. Choose the nationalities you want to hear from and everything else goes quiet. ' +
      '45 countries are on the list, and “All nationalities” is one tap away when you want ' +
      'the whole city back.',
    ],
  },
  {
    h: 'Post what is happening, in a few taps',
    img: 'screen-create',
    alt: 'The yOdin new-post sheet, with category chips, a topic field and media buttons',
    p: [
      'A category, a topic, a description, a photo or a video. Events carry their date, so ' +
      'a concert someone posted three weeks ago is still findable on the right evening ' +
      'rather than buried under this morning.',
    ],
  },
  {
    h: 'A forum where one answer is marked right',
    p: [
      'Questions about residence cards, landlords, doctors and paperwork get asked in every ' +
      'diaspora in the world, and the answer is usually already known by someone two streets ' +
      'away. In the yOdin forum whoever asked can mark the reply that actually solved it, so ' +
      'the next person who searches the same question reads the answer first and the thread ' +
      'second.',
    ],
  },
  {
    h: 'Profiles, following and notifications',
    p: [
      'An @username, a nationality, the city you are in. Follow the people worth following ' +
      'and the app tells you when someone replies to you, mentions you, joins a discussion ' +
      'you are in, or accepts your answer.',
    ],
  },
  {
    h: 'Moderated, and the block button is yours',
    p: [
      'Every post, discussion, comment and reply has a Report action, and reports are read ' +
      'by people. Enforcement escalates rather than jumping to a ban — except for the cases ' +
      'that deserve no warning, which are set out in the ' +
      '<a href="/apps/yodin/child-safety-standards/">Child Safety Standards</a>. You can ' +
      'block anyone, for any reason, without explaining it to us or to them.',
    ],
  },
];

/*
 * Plain text, not an accordion. A <details> element hides its answer from the rendered
 * page until it is clicked, and while Google does index collapsed content, the visitor
 * who scrolled this far is reading rather than clicking. FAQPage structured data is
 * deliberately absent too: Google stopped showing FAQ rich results for ordinary sites in
 * 2023, so the markup would cost bytes and return nothing.
 */
const FAQ = [
  [
    'Who is yOdin for?',
    'Anyone living away from the country they are from — students, workers, families who ' +
    'moved. It is most useful where there are enough people from one place to make a ' +
    'conversation, which in practice means cities.',
  ],
  [
    'Does it cost anything?',
    'No. yOdin is free, there is no paid tier, and there is no advertising of any kind in ' +
    'the app.',
  ],
  [
    'Is there an iPhone version?',
    'It is in development, and it is not on the App Store yet — so there is nothing to ' +
    'install on an iPhone today. Android is the released one.',
  ],
  [
    'What does it need to run?',
    'Android 7.0 or later. The interface is translated into 27 languages and picks the one ' +
    'your phone is set to.',
  ],
  [
    'Is my location tracked?',
    'No. yOdin does not collect location, does not use analytics, and carries no advertising ' +
    'identifiers. What it does hold is listed in the ' +
    '<a href="/apps/yodin/privacy/">privacy policy</a>.',
  ],
  [
    'How do I delete my account?',
    'In the app: open the Profile tab, tap the menu button (☰) in the top right corner, ' +
    'and choose Delete account at the bottom of the panel that slides in. What is erased ' +
    'and what is kept is spelled out on the ' +
    '<a href="/apps/yodin/delete-account/">account deletion page</a>.',
  ],
  [
    'Who makes it?',
    'The app is built by <a href="/">OnlyMaxon</a>, a product studio in Warsaw, and ' +
    'published on Google Play by EA DIGITAL GROUP, MMC. Support and anything else: ' +
    '<a href="mailto:hello@onlymaxon.com">hello@onlymaxon.com</a>.',
  ],
];

/*
 * HOW iOS IS HANDLED, AND WHY IT CHANGED. Max first asked for no mention of iOS at all,
 * then on 2026-10-11 for the opposite: the iPhone build does exist, it is in development,
 * Apple has not replied yet, and he wants the site to show it with a badge beside Google's
 * even though there is nowhere for that badge to lead.
 *
 * So the page says it is in development and says, in the same breath, that it is not on
 * the App Store — which is the honest version of the same claim and the one that will not
 * read as a bait button to the testers looking at this now. The badge is drawn in this
 * page's own CSS. Apple's artwork is licensed for apps that are actually listed on the
 * App Store, and this one has not been submitted; borrowing it for an unlisted app is the
 * kind of thing that surfaces at App Review. The structured data still says Android only,
 * because that is the platform a visitor can actually install on today, and announcing an
 * availability that does not exist to Google is a different and worse mistake.
 *
 * WHEN THE APP IS LISTED: swap the <span class="soon"> for Apple's real badge, link it,
 * add iOS to `operatingSystem` in the structured data, and update the FAQ answer.
 */
const FOOT = [
  ['/apps/yodin/terms/', 'Terms of use'],
  ['/apps/yodin/privacy/', 'Privacy policy'],
  ['/apps/yodin/delete-account/', 'Delete your account'],
  ['/apps/yodin/child-safety-standards/', 'Child safety'],
];

/*
 * Inter, the app's own typeface, in the three weights this page draws and in Latin only.
 * The page has no Cyrillic on it, and the unicode-range split means an unused cut is never
 * fetched anyway — but declaring one would still cost a line a reader has to check.
 */
const LATIN =
  'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, ' +
  'U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, ' +
  'U+FEFF, U+FFFD';
const LATIN_EXT =
  'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, ' +
  'U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, ' +
  'U+2113, U+2C60-2C7F, U+A720-A7FF';

const fonts = [400, 600, 700]
  .flatMap(w => [['latin', LATIN], ['latin-ext', LATIN_EXT]].map(([cut, range]) =>
    `    @font-face { font-family: 'Inter'; font-style: normal; font-weight: ${w}; font-display: swap;
                 src: url(/fonts/inter-${w}-${cut}.woff2) format('woff2');
                 unicode-range: ${range}; }`))
  .join('\n');

/*
 * yOdin's palette, light and dark, taken from src/theme/colors.ts in the app. The page has
 * to read as the app's own home rather than as a studio template, and the visitor who
 * arrives here after seeing the store listing should not have to wonder whether they are
 * in the right place. The violet gradient is the app's button gradient at 135°, which is
 * also what the store screenshots sit on — so the cropped phones blend into it exactly.
 */
const CSS = `
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --violet: #6C35DE; --violet-l: #8B5CF6; --coral: #FF6B6B;
      /* The app's textSecondary is #7B6FA0, and it stays that in the app, where it is only
         ever drawn on white cards. On this page's lilac background it measures 4.04:1 —
         under AA for body copy — so the page runs it a shade darker at 4.90:1. */
      --bg: #F3F0FB; --surface: #FFFFFF; --text: #18132A; --dim: #6F628D;
      --rule: #E2DCF3; --tint: #EDE8F9; --link: #6C35DE;
      --grad: linear-gradient(135deg, #6C35DE 0%, #8B5CF6 100%);
      --shadow: 0 24px 60px rgba(32, 14, 78, 0.16);
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --violet: #8B5CF6; --violet-l: #A78BFA;
        --bg: #0F0A1E; --surface: #1C1530; --text: #F0ECF9; --dim: #9B8FC4;
        --rule: #2E2248; --tint: #231A3A; --link: #C4B5F7;
        --shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
      }
    }
    html { -webkit-text-size-adjust: 100%; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--bg); color: var(--text);
      font-size: 17px; line-height: 1.65; letter-spacing: -0.004em;
      -webkit-font-smoothing: antialiased;
    }
    .wrap { max-width: 1080px; margin: 0 auto; padding: 0 24px; }
    a { color: var(--link); text-decoration-thickness: 1px; text-underline-offset: 2px; }
    img { max-width: 100%; height: auto; display: block; }

    /* ── top bar ─────────────────────────────────────────────────────────── */
    .bar { padding: 20px 0; }
    .bar .wrap { display: flex; align-items: center; gap: 12px; }
    .bar img { width: 34px; height: 34px; border-radius: 9px; }
    .bar b { font-weight: 700; font-size: 19px; letter-spacing: -0.02em; }
    .bar .by { margin-left: auto; font-size: 15px; color: var(--dim); }

    /* ── hero ────────────────────────────────────────────────────────────── */
    /*
     * The brand gradient, plus a scrim over whichever part of it the copy sits on.
     *
     * White text on the light end of #6C35DE → #8B5CF6 measures 4.59:1 at best and worse
     * than that on a narrow screen, where the copy spans the full width and reaches
     * further along the gradient. Rather than darken the gradient itself — the cropped
     * screenshots carry a sliver of this exact violet at their edges, which is the only
     * reason they sit on it invisibly — the scrim fades out before it reaches the phone.
     * It runs top-to-bottom while the copy is stacked above the phone, and left-to-right
     * once they are side by side.
     */
    .hero {
      background:
        linear-gradient(180deg, rgba(10,4,30,0.26) 0%, rgba(10,4,30,0.10) 52%,
                                rgba(10,4,30,0) 72%),
        var(--grad);
      color: #fff; position: relative; overflow: hidden;
      border-radius: 28px; margin: 0 24px; padding: 64px 0 0;
    }
    .hero::before, .hero::after {
      content: ''; position: absolute; border-radius: 50%;
      background: rgba(255,255,255,0.07); pointer-events: none;
    }
    .hero::before { width: 720px; height: 720px; right: -220px; top: -260px; }
    .hero::after  { width: 420px; height: 420px; right: -70px;  top: -110px; }
    .hero .wrap { position: relative; display: grid; gap: 40px; align-items: end;
                  grid-template-columns: 1fr; }
    h1 { font-size: clamp(38px, 6.4vw, 62px); line-height: 1.03; font-weight: 700;
         letter-spacing: -0.035em; }
    /* Both of these are pure white rather than the 90%-ish white a hero lede usually gets.
       Measured against the gradient they actually land on, 90% white drops to 4.1:1 around
       768px wide — under AA — and the hierarchy they were buying with opacity is already
       carried by size and weight. */
    .lede { font-size: clamp(18px, 2.2vw, 21px); line-height: 1.5; margin-top: 20px;
            color: #fff; max-width: 30em; }
    /* Google's badge guidelines ask for clear space of at least a quarter of the badge's
       height on every side. At 75px tall that is 18.75px, so the gap is 24. */
    .cta { margin-top: 30px; display: flex; flex-wrap: wrap; align-items: center; gap: 24px; }
    .cta img { width: 194px; height: 75px; }
    .cta a { display: inline-block; border-radius: 8px; }
    .cta a:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }
    /* The iPhone counterpart, drawn here rather than taken from Apple. It copies the
       Play badge's proportions and two-line structure so the pair reads as a set, and
       none of Apple's artwork, logo or wording. See the note above the markup. */
    .soon { display: flex; flex-direction: column; justify-content: center;
            height: 75px; padding: 0 22px; border-radius: 10px; color: #fff;
            box-shadow: inset 0 0 0 1px rgba(255,255,255,0.45); }
    .soon b { font-size: 10px; font-weight: 600; letter-spacing: 0.09em;
              text-transform: uppercase; }
    .soon i { font-style: normal; font-size: 21px; font-weight: 600;
              letter-spacing: -0.01em; line-height: 1.15; }
    .terms-line { font-size: 15px; color: #fff; margin-top: 18px; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 30px; }
    /* A dark fill, not a light one: a translucent white pill lightens the violet under the
       label and takes the contrast down, which is the opposite of what a pill is for. */
    .chip { font-size: 14px; font-weight: 600; padding: 5px 13px; border-radius: 999px;
            color: #fff; background: rgba(13,5,32,0.30);
            box-shadow: inset 0 0 0 1px rgba(255,255,255,0.20); }
    .chip i { font-style: normal; display: inline-block; width: 8px; height: 8px;
              border-radius: 50%; margin-right: 7px; vertical-align: 1px; }
    .shot { margin: 0 auto -2px; width: min(300px, 72vw); }
    @media (min-width: 860px) {
      .hero {
        padding-top: 76px;
        background:
          linear-gradient(100deg, rgba(10,4,30,0.26) 0%, rgba(10,4,30,0.12) 46%,
                                  rgba(10,4,30,0) 64%),
          var(--grad);
      }
      /* The phone is meant to run off the bottom edge, so the two columns are bottom
         aligned — which left the category chips flush against that same edge. The copy
         column keeps its own floor. */
      .hero .wrap { grid-template-columns: 1fr auto; gap: 56px; }
      .hero .copy { padding-bottom: 62px; }
      .shot { margin: 0; width: 320px; }
    }

    /* ── features ────────────────────────────────────────────────────────── */
    section { padding: 76px 0 0; }
    h2 { font-size: clamp(26px, 3.4vw, 34px); line-height: 1.15; font-weight: 700;
         letter-spacing: -0.028em; }
    .feature { display: grid; gap: 30px; align-items: center; margin-top: 44px;
               grid-template-columns: 1fr; }
    .feature p { margin-top: 14px; color: var(--dim); max-width: 34em; }
    .feature .pane {
      background: var(--grad); border-radius: 24px; padding: 34px 0 0;
      display: flex; justify-content: center; box-shadow: var(--shadow); overflow: hidden;
    }
    .feature .pane img { width: min(252px, 62vw); margin-bottom: -2px; }
    @media (min-width: 860px) {
      .feature.paired { grid-template-columns: 1fr 380px; gap: 56px; }
      .feature.paired.flip { grid-template-columns: 380px 1fr; }
      .feature.paired.flip .text { order: 2; }
    }

    /* ── reach ───────────────────────────────────────────────────────────── */
    .reach { margin-top: 44px; background: var(--surface); border: 1px solid var(--rule);
             border-radius: 24px; padding: 34px; }
    .nums { display: flex; flex-wrap: wrap; gap: 14px 56px; }
    .num b { display: block; font-size: 42px; line-height: 1.1; font-weight: 700;
             letter-spacing: -0.03em; color: var(--violet); }
    .num span { font-size: 15px; color: var(--dim); }
    .langs { margin-top: 26px; padding-top: 24px; border-top: 1px solid var(--rule);
             font-size: 15px; color: var(--dim); line-height: 1.9; }

    /* ── faq ─────────────────────────────────────────────────────────────── */
    .faq { margin-top: 36px; display: grid; gap: 2px; }
    .qa { background: var(--surface); border: 1px solid var(--rule); padding: 24px 26px; }
    .qa:first-child { border-radius: 18px 18px 0 0; }
    .qa:last-child { border-radius: 0 0 18px 18px; }
    .qa + .qa { border-top: 0; }
    .qa h3 { font-size: 17px; font-weight: 600; letter-spacing: -0.01em; }
    .qa p { margin-top: 7px; color: var(--dim); }

    /* ── footer ──────────────────────────────────────────────────────────── */
    footer { margin-top: 80px; padding: 34px 0 54px; border-top: 1px solid var(--rule);
             font-size: 15px; color: var(--dim); }
    footer ul { list-style: none; display: flex; flex-wrap: wrap; gap: 10px 24px; }
    footer .meta { margin-top: 18px; }

    @media (prefers-reduced-motion: no-preference) {
      a, .cta a { transition: opacity .15s ease; }
      .cta a:hover { opacity: .88; }
    }`;

/*
 * Two objects, both of them things Google can act on: the app itself, and the studio that
 * made it. There is deliberately no aggregateRating — the app has too few ratings to quote
 * and inventing one is both a policy breach and a lie — and no FAQPage, for the reason
 * given above the FAQ copy.
 */
function jsonld() {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': `${HERE}#app`,
        name: 'yOdin',
        url: HERE,
        description: DESC,
        applicationCategory: 'SocialNetworkingApplication',
        operatingSystem: 'Android 7.0 and later',
        softwareVersion: '1.1.0',
        downloadUrl: PLAY,
        installUrl: PLAY,
        image: `${SITE}/images/yodin/og.jpg`,
        screenshot: ['screen-feed', 'screen-nationality', 'screen-create']
          .map(s => `${SITE}/images/yodin/${s}.webp`),
        inLanguage: ['ar', 'az', 'bn', 'cs', 'de', 'en', 'es', 'fa', 'fr', 'he', 'hi', 'id',
                     'it', 'ja', 'ko', 'ms', 'nl', 'pl', 'pt', 'ro', 'ru', 'sv', 'th', 'tr',
                     'uk', 'vi', 'zh'],
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        publisher: { '@type': 'Organization', name: 'EA DIGITAL GROUP, MMC' },
        author: { '@id': `${SITE}/#org` },
        privacyPolicy: `${SITE}/apps/yodin/privacy/`,
      },
      {
        '@type': 'Organization',
        '@id': `${SITE}/#org`,
        name: 'OnlyMaxon',
        url: `${SITE}/`,
        logo: `${SITE}/images/logo.jpg`,
        email: 'hello@onlymaxon.com',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Chmielna 69',
          addressLocality: 'Warsaw',
          addressCountry: 'PL',
        },
      },
    ],
  }, null, 2);
}

const shot = (name, alt, cls) =>
  `<img class="${cls}" src="/images/yodin/${name}.webp" alt="${alt}" ` +
  `width="${SHOT.w}" height="${SHOT.h}">`;

function page() {
  const features = FEATURES.map((f, i) => {
    const text = `<div class="text"><h2>${f.h}</h2>` +
                 f.p.map(p => `<p>${p}</p>`).join('') + `</div>`;
    if (!f.img) return `      <div class="feature">${text}</div>`;
    // Alternating sides, so five blocks do not read as one long column.
    const flip = i % 2 === 1 ? ' flip' : '';
    return `      <div class="feature paired${flip}">${text}` +
           `<div class="pane">${shot(f.img, f.alt, '')}</div></div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<!--
  GENERATED — edit build/yodin.js, not this file, then run:

      node build/generate.js

  The front door of the yOdin app on this domain. The legal pages beside it are built by
  build/apps.js and are noindex; this one is the opposite and is meant to rank. Every
  number in the copy was checked against the app's own source in D:\\VS\\yOdin.
-->
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${TITLE}</title>
  <meta name="description" content="${DESC}">
  <link rel="canonical" href="${HERE}">
  <meta name="robots" content="index, follow">

  <!-- The app is violet in both schemes; the browser chrome should not announce a page
       that is about to be lilac by painting itself white first. -->
  <meta name="theme-color" content="#6C35DE" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#0F0A1E" media="(prefers-color-scheme: dark)">

  <link rel="icon" href="/favicon.ico" sizes="any">
  <!-- The app's own icon, so a page saved to a phone's home screen keeps the app's face. -->
  <link rel="apple-touch-icon" href="/images/yodin/icon-180.png">

  <!-- The two faces the first screen draws: the headline at 700 and the lede at 400.
       crossorigin is required even same-origin or the preload is thrown away and the font
       fetched a second time. The hero screenshot is the largest element on that screen,
       so it is fetched at the same priority rather than discovered when the CSS lands. -->
  <link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/inter-700-latin.woff2">
  <link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/inter-400-latin.woff2">
  <link rel="preload" as="image" href="/images/yodin/screen-feed.webp" fetchpriority="high">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="OnlyMaxon">
  <meta property="og:title" content="${TITLE}">
  <meta property="og:description" content="${DESC}">
  <meta property="og:url" content="${HERE}">
  <meta property="og:image" content="${SITE}/images/yodin/og.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="yOdin — find your people abroad">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${TITLE}">
  <meta name="twitter:description" content="${DESC}">
  <meta name="twitter:image" content="${SITE}/images/yodin/og.jpg">

  <script type="application/ld+json">
${jsonld()}
  </script>

  <style>
${fonts}
${CSS}
  </style>
</head>
<body>

  <div class="bar">
    <div class="wrap">
      <img src="/images/yodin/icon-180.png" alt="" width="180" height="180">
      <b>yOdin</b>
      <span class="by">Built by <a href="/">OnlyMaxon</a></span>
    </div>
  </div>

  <main>
    <div class="hero">
      <div class="wrap">
        <div class="copy">
          <h1>Find your people abroad</h1>
          <p class="lede">yOdin is a community for everyone living far from home — the news,
            events and places of the city you moved to, filtered to the people you came
            from.</p>
          <div class="cta">
            <a href="${PLAY}">
              <img src="/images/yodin/badge-google-play.png"
                   alt="Get yOdin on Google Play" width="646" height="250">
            </a>
            <!-- Not Apple's badge, and not a link. The iPhone build exists but has never
                 been submitted, so there is nothing on the App Store to point at; Apple's
                 badge may only be used for an app that is actually listed there. This one
                 borrows the Play badge's proportions so the pair looks deliberate, says
                 plainly that it is not out, and is inert rather than a button that does
                 nothing when tapped. Swap it for the real badge once the app is listed. -->
            <span class="soon"><b>Coming soon for</b><i>iPhone</i></span>
          </div>
          <p class="terms-line">Free, no ads. Android 7.0 and later.<br>
            The iPhone version is in development and not on the App Store yet.</p>
          <div class="chips">
${CATEGORIES.map(([n, c]) =>
  `            <span class="chip"><i style="background:${c}"></i>${n}</span>`).join('\n')}
          </div>
        </div>
        ${shot('screen-feed',
               'The yOdin feed on a phone, showing a news post from Warsaw with category ' +
               'and nationality filters above it', 'shot')}
      </div>
    </div>

    <section>
      <div class="wrap">
${features}
      </div>
    </section>

    <section>
      <div class="wrap">
        <h2>Wherever you moved, in whatever language you read</h2>
        <div class="reach">
          <div class="nums">
            <div class="num"><b>27</b><span>interface languages</span></div>
            <div class="num"><b>45</b><span>nationalities to filter by</span></div>
            <div class="num"><b>0</b><span>ads, trackers, paid tiers</span></div>
          </div>
          <p class="langs">Arabic · Azerbaijani · Bengali · Chinese · Czech · Dutch ·
            English · Farsi · French · German · Hebrew · Hindi · Indonesian · Italian ·
            Japanese · Korean · Malay · Polish · Portuguese · Romanian · Russian ·
            Spanish · Swedish · Thai · Turkish · Ukrainian · Vietnamese</p>
        </div>
      </div>
    </section>

    <section>
      <div class="wrap">
        <h2>Questions</h2>
        <div class="faq">
${FAQ.map(([q, a]) =>
  `          <div class="qa"><h3>${q}</h3><p>${a}</p></div>`).join('\n')}
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="wrap">
      <ul>
${FOOT.map(([href, label]) =>
  `        <li><a href="${href}">${label}</a></li>`).join('\n')}
        <li><a href="mailto:hello@onlymaxon.com">hello@onlymaxon.com</a></li>
      </ul>
      <p class="meta">yOdin is built by <a href="/">OnlyMaxon</a> and published on Google
        Play by EA DIGITAL GROUP, MMC.</p>
    </div>
  </footer>

</body>
</html>
`;
}

/*
 * A second sitemap rather than an entry in the first one.
 *
 * sitemap.xml is written by generate.js from its 14-page × 5-language table, and every URL
 * in it carries a full hreflang set. These pages have neither: one language, no
 * translations, and they are written after that file has already been closed. Splicing
 * them in afterwards would mean reopening a file whose own lastmod bookkeeping had just
 * finished, and the dates — which generate.js keeps nowhere but inside the sitemap itself —
 * would have been lost by then.
 *
 * So this file keeps its own, with the same rule: a date only moves when the bytes move.
 * Both sitemaps are listed in robots.txt and both should be submitted in Search Console.
 */
function sitemap(urls) {
  const file = path.join(ROOT, 'sitemap-apps.xml');
  const today = new Date().toISOString().slice(0, 10);

  const prev = new Map();
  if (fs.existsSync(file)) {
    const xml = fs.readFileSync(file, 'utf8');
    for (const m of xml.matchAll(/<loc>([^<]*)<\/loc>\s*<lastmod>([^<]*)<\/lastmod>/g))
      prev.set(m[1], m[2]);
  }

  const body = urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.changed || !prev.has(u.loc) ? today : prev.get(u.loc)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n');

  fs.writeFileSync(file,
`<?xml version="1.0" encoding="UTF-8"?>
<!-- The indexable pages under /apps/. Written by build/yodin.js; the 14-page × 5-language
     site has its own sitemap.xml, and both are declared in robots.txt. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`);
  return urls.length;
}

/*
 * `appPages` is what build/apps.js returned: its indexable pages and whether each one just
 * changed. Passing it in rather than recomputing it here keeps one answer to the question
 * of which app pages belong in a sitemap, and that answer stays where the pages are built.
 */
function build(appPages = []) {
  console.log('');
  console.log('app landing (build/yodin.js)');

  const file = path.join(ROOT, 'apps', 'yodin', 'index.html');
  const html = page();
  const before = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n') : null;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  const changed = before !== html;

  console.log('  apps/yodin/index.html'.padEnd(46) +
              `${(html.length / 1024).toFixed(1)} KB   indexed` +
              (before === null ? '   ← new' : changed ? '   ← changed' : ''));

  const n = sitemap([
    { loc: HERE, changed, priority: '0.8' },
    ...appPages.map(p => ({ ...p, priority: '0.3' })),
  ]);
  console.log('  sitemap-apps.xml'.padEnd(46) + `${n} URLs`);
}

module.exports = { build };
