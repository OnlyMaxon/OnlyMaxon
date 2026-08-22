/*
 * Generates the translated versions of the site.
 *
 *   node build/generate.js
 *
 * Every page has an English source of truth that is never modified. For each other
 * language it emits <lang>/<path>/index.html with the text baked in, so each language is
 * a real URL that Google can crawl and rank — instead of one page rewritten by JS.
 *
 * Re-run this whenever you edit a page source or build/translations.js.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
// Sources live under build/, which robots.txt already disallows, so they are never
// crawled as a second copy of the site. Nothing here is served as a page: every English
// URL is built from build/src/ exactly like the other four languages, which is what lets
// the English pages be stripped of their comments too — they used to be shipped verbatim,
// and on the home page that was 30% of the file.
const SRC = path.join('build', 'src');
const SITE = 'https://onlymaxon.com';
const SOURCE_LANG = 'en';
const LANGS = ['pl', 'ru', 'tr', 'es'];
const ALL_LANGS = [SOURCE_LANG, ...LANGS];
const NAMES = { en: 'English', pl: 'Polski', ru: 'Русский', tr: 'Türkçe', es: 'Español' };

/*
 * Every page the site ships.
 *
 *   path      URL segment; '' is the site root. The English source lives at
 *             <path>/index.html and the translations at <lang>/<path>/index.html.
 *   titleKey  translation key for the <title> tail, deliberately separate from the
 *             on-screen headline so the two can be edited independently.
 *   descKey   translation key feeding meta description, Open Graph and Twitter cards.
 *   faq       true if the page carries a FAQPage block that must be regenerated.
 *   priority  sitemap priority for the source-language URL and for the translations.
 *
 * Adding a page means adding a line here and writing its English source — everything
 * else (canonical, hreflang, the language menus, the sitemap) follows automatically.
 */
const PAGES = [
  {
    path: '',
    titleKey: 'metaTitle',
    descKey: 'heroSub',
    faq: true,
    priority: { source: '1.0', translated: '0.9' },
  },
  {
    path: 'product',
    titleKey: 'prMetaTitle',
    descKey: 'prMetaDesc',
    faq: false,
    priority: { source: '0.9', translated: '0.8' },
  },
  /*
   * The service pages. The home page is about the studio and ranks for its own name;
   * these are each about one service and are the only pages on the site written for
   * somebody who has never heard of OnlyMaxon and is typing what they need into Google.
   * Priority sits alongside /product/ rather than below it — for a stranger arriving from
   * search, these are the front door.
   */
  {
    path: 'services',
    titleKey: 'svMetaTitle',
    descKey: 'svMetaDesc',
    faq: false,
    priority: { source: '0.9', translated: '0.8' },
  },
  {
    path: 'services/websites',
    titleKey: 'swMetaTitle',
    descKey: 'swMetaDesc',
    faq: false,
    priority: { source: '0.9', translated: '0.8' },
  },
  {
    path: 'services/seo',
    titleKey: 'ssMetaTitle',
    descKey: 'ssMetaDesc',
    faq: false,
    priority: { source: '0.9', translated: '0.8' },
  },
  {
    path: 'blog',
    titleKey: 'blMetaTitle',
    descKey: 'blMetaDesc',
    faq: false,
    priority: { source: '0.8', translated: '0.7' },
  },
  {
    path: 'blog/not-in-google',
    titleKey: 'b1MetaTitle',
    descKey: 'b1MetaDesc',
    faq: false,
    article: true,
    priority: { source: '0.7', translated: '0.6' },
  },
  {
    path: 'blog/what-a-website-costs',
    titleKey: 'b2MetaTitle',
    descKey: 'b2MetaDesc',
    faq: false,
    article: true,
    priority: { source: '0.7', translated: '0.6' },
  },
  {
    path: 'blog/google-answers-now',
    titleKey: 'b3MetaTitle',
    descKey: 'b3MetaDesc',
    faq: false,
    article: true,
    priority: { source: '0.7', translated: '0.6' },
  },
  {
    path: 'blog/website-or-instagram',
    titleKey: 'b4MetaTitle',
    descKey: 'b4MetaDesc',
    faq: false,
    article: true,
    priority: { source: '0.7', translated: '0.6' },
  },
  {
    path: 'cases/nextcargo',
    titleKey: 'c1MetaTitle',
    descKey: 'c1MetaDesc',
    faq: false,
    article: true,
    priority: { source: '0.8', translated: '0.7' },
  },
  {
    path: 'cases/birklik',
    titleKey: 'c2MetaTitle',
    descKey: 'c2MetaDesc',
    faq: false,
    article: true,
    priority: { source: '0.8', translated: '0.7' },
  },
  {
    path: 'cases/yodin',
    titleKey: 'c3MetaTitle',
    descKey: 'c3MetaDesc',
    faq: false,
    article: true,
    priority: { source: '0.8', translated: '0.7' },
  },
  {
    path: 'privacy',
    titleKey: 'ppMetaTitle',
    descKey: 'ppMetaDesc',
    faq: false,
    priority: { source: '0.3', translated: '0.3' },
  },
];

const translations = require('./translations.js');

const fail = msg => { console.error('\n  ERROR: ' + msg + '\n'); process.exit(1); };
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = s => esc(s).replace(/"/g, '&quot;');
const stripTags = s => s.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

/*
 * ── Google reviews ───────────────────────────────────────────────────────────
 *
 * From build/reviews.json, which a human fills in today and build/fetch-reviews.js
 * overwrites on a cron once the Business Profile API grants access. One file, one shape,
 * so the temporary way and the permanent way reach the page through the same code.
 *
 * They pointedly do NOT go through the translation table. Every key there must exist in
 * five languages or the build fails — the right rule for the studio's own copy, and an
 * impossible one for other people's words: the first review the cron pulled would break
 * the build until someone translated a stranger into Turkish. So reviews arrive as data,
 * and only the frame around them is translated.
 */
const REVIEWS_FILE = path.join(__dirname, 'reviews.json');
const REVIEWS = fs.existsSync(REVIEWS_FILE)
  ? JSON.parse(fs.readFileSync(REVIEWS_FILE, 'utf8'))
  : { reviews: [] };

// Past this the section stops reading as proof and starts reading as a wall of text.
// The profile can hold three hundred; the page shows the newest handful.
const MAX_REVIEWS = 12;
const shownReviews = (REVIEWS.reviews || []).slice(0, MAX_REVIEWS);

// Checked here rather than at render time: a malformed entry would otherwise emit a card
// reading "undefined" into all five languages and only be noticed in production.
shownReviews.forEach((r, i) => {
  const bad = !r.author || !r.text || !Number.isInteger(r.rating) ||
              r.rating < 1 || r.rating > 5 || !/^\d{4}-\d{2}-\d{2}$/.test(r.time || '');
  if (bad) fail(`build/reviews.json entry #${i + 1}: needs author, text, an integer ` +
                `rating 1-5, and time as YYYY-MM-DD`);
});

const avgRating = REVIEWS.rating != null ? REVIEWS.rating
  : shownReviews.length ? shownReviews.reduce((s, r) => s + r.rating, 0) / shownReviews.length
  : 5;

const initials = name =>
  name.trim().split(/\s+/).slice(0, 2).map(w => [...w][0]).join('').toUpperCase();
const starRow = n => '★'.repeat(n) + '☆'.repeat(5 - n);

// "July 2026", "lipiec 2026". No day number: it makes a perfectly good review from the
// 3rd look staler than the same one from the 28th, and nobody picks a studio by date.
// Russian ICU appends " г." — correct in a document, noise in a 42px card.
const reviewMonth = (iso, lang) => new Date(iso + 'T00:00:00Z')
  .toLocaleDateString(lang, { year: 'numeric', month: 'long', timeZone: 'UTC' })
  .replace(/\s*г\.$/, '');

function reviewCards(lang) {
  return shownReviews.map((r, i) => `
        <article class="rv-card fade-up${i % 3 ? ' d' + (i % 3) : ''}">
          <div class="rv-top">
            <div class="rv-ava" aria-hidden="true">${esc(initials(r.author))}</div>
            <div class="rv-who">
              <div class="rv-name">${esc(r.author)}</div>
              <div class="rv-date">${esc(reviewMonth(r.time, lang))}</div>
            </div>
          </div>
          <div class="rv-rating" role="img" aria-label="${r.rating}/5">${starRow(r.rating)}</div>
          <p class="rv-text">${esc(r.text).replace(/\r?\n+/g, '<br>')}</p>
        </article>`).join('') + '\n      ';
}

// Where a page lives, as a root-relative href and as an absolute URL. The source
// language sits at the top level (/, /product/), the rest one directory deeper.
const href = (lang, p) => '/' + (lang === SOURCE_LANG ? '' : lang + '/') + (p ? p + '/' : '');
const url  = (lang, p) => SITE + href(lang, p);

/*
 * The sources are commented the way they are on purpose — they are the documentation, and
 * the reasoning behind a rule is worth more than the rule. None of it has to reach a
 * browser: on the home page the comments are ~16 KB, an eighth of the file.
 *
 * Only unambiguous comments are removed. A `//` that follows code on the same line is
 * left where it is: telling it apart from the `//` in an URL needs a real tokeniser, and
 * a few hundred bytes are not worth a build that can quietly corrupt a script. Whatever
 * this does emit is handed to the JS parser before it is allowed out.
 */
function stripComments(html, label) {
  // Split so that each comment syntax is only applied where it actually means "comment".
  const parts = html.split(/(<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>)/);

  return parts.map(part => {
    if (part.startsWith('<style')) {
      return part.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n[ \t]*(?=\n)/g, '');
    }

    if (part.startsWith('<script')) {
      // JSON has no comment syntax and its payload is full of "https://" — hands off.
      if (/type="application\/ld\+json"/.test(part)) return part;
      // A template literal spanning lines could carry a line beginning with `//` as data.
      // Splitting on the backtick puts literal bodies at the odd indices — testing the
      // gap between any two backticks instead would flag the newline that merely sits
      // between two separate single-line literals, which is most of them.
      const segments = part.split('`');
      if (segments.some((s, i) => i % 2 === 1 && s.includes('\n'))) {
        console.log(`  note: ${label} has a multi-line template literal, comments kept`);
        return part;
      }

      const out = part
        .replace(/^[ \t]*\/\*[\s\S]*?\*\/[ \t]*\r?\n/gm, '')   // block comment on its own lines
        .replace(/^[ \t]*\/\/.*\r?\n/gm, '')                   // whole-line // comment
        .replace(/\n[ \t]*(?=\n)/g, '');

      const body = out.replace(/^<script\b[^>]*>/, '').replace(/<\/script>$/, '');
      try { new vm.Script(body); }
      catch (e) { fail(`${label}: stripping comments broke a script — ${e.message}`); }
      return out;
    }

    return part.replace(/<!--[\s\S]*?-->/g, '').replace(/\n[ \t]*(?=\n)/g, '');
  }).join('');
}

// ── read + validate every source ──────────────────────────────────────────────
// Normalise to LF. Git is configured to check files out with CRLF on this machine, so
// after any `git checkout index.html` the source comes back with \r\n — and the
// structured-data patterns below, which match on \n, silently stop matching.
for (const page of PAGES) {
  page.src = path.join(SRC, page.path, 'index.html');
  const file = path.join(ROOT, page.src);
  if (!fs.existsSync(file)) fail(`${page.src} does not exist (declared in PAGES)`);
  page.source = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

  page.keys = new Set([...page.source.matchAll(/data-i18n(?:-html|-ph)?="([\w]+)"/g)].map(m => m[1]));
  // Not carried by a data-i18n attribute: these are consumed by the build itself.
  page.keys.add('modalSuccess').add('modalError').add(page.titleKey).add(page.descKey);

  // Document order of the FAQ accordion, reused below to build the rich result.
  page.faqOrder = [...page.source.matchAll(/data-i18n="faq(\d+)Q"/g)].map(m => m[1]);
  if (page.faq && !page.faqOrder.length) fail(`${page.src}: declared faq:true but has no faq questions`);
  for (const i of page.faqOrder) {
    if (!translations['faq' + i + 'A']) fail(`${page.src}: faq${i}Q has no matching faq${i}A`);
  }
}

// The studio's Google profile is named in two files that have to agree: build/reviews.json,
// which the reviews block and the cron both read, and the "sameAs" array in the structured
// data, which is what tells Google the profile and this site are one business rather than
// two strangers. Nothing would notice them drifting apart — the page would still render and
// the link would still work, while the connection they exist to make quietly stopped being
// made.
for (const page of PAGES) {
  const sameAs = page.source.match(/"sameAs": \[([\s\S]*?)\]/);
  if (!sameAs || !/google\.com\/maps/.test(sameAs[1])) continue;
  if (REVIEWS.profileUrl && !sameAs[1].includes(REVIEWS.profileUrl))
    fail(`${page.src}: the Google profile in "sameAs" is not the one in build/reviews.json\n` +
         `      reviews.json says: ${REVIEWS.profileUrl}`);
}

// English lives in two places at once — inline in the page source, which is what visitors
// actually read, and as the .en entry in translations.js, which is what the "still
// English" guard below compares against. Nothing kept them in step: editing only the
// translation left the English page saying one thing and the other four saying another,
// silently, because no substitution ever runs on English.
// Entities are decoded before comparing: the page has to write "&amp;" where the
// translation quite reasonably just writes "&", and that is not a drift.
const norm = s => s
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ').trim();
const drift = [];
for (const page of PAGES) {
  for (const m of page.source.matchAll(/(<([a-z0-9]+)[^>]*\bdata-i18n="(\w+)"[^>]*>)([\s\S]*?)(<\/\2>)/g)) {
    const [, , , key, inline] = m;
    if (!translations[key]) continue;                 // reported as missing below
    if (norm(inline) !== norm(translations[key].en || '')) {
      drift.push(`${key} (${page.src})\n      page: ${norm(inline)}\n      .en : ${norm(translations[key].en || '')}`);
    }
  }
}
if (drift.length) fail(`English source and translations.en disagree:\n    ` + drift.join('\n    '));

const usedKeys = new Set(PAGES.flatMap(p => [...p.keys]));

// ALL_LANGS, not LANGS: English is built from this table now too, so a key with no .en
// would quietly replace the English sentence on the page with nothing at all. Before the
// English pages were generated, a missing .en only tripped the drift check above.
const missing = [];
for (const key of usedKeys) {
  if (!translations[key]) { missing.push(`${key} (no entry at all)`); continue; }
  for (const lang of ALL_LANGS) {
    if (!translations[key][lang] || !translations[key][lang].trim()) missing.push(`${key}.${lang}`);
  }
}
if (missing.length) fail(`missing translations:\n    ` + missing.join('\n    '));

const unused = Object.keys(translations).filter(k => !usedKeys.has(k));

/*
 * ── reading time ─────────────────────────────────────────────────────────────
 *
 * Counted, not typed. Every article carried a hand-written "4 min read" in all five
 * languages — wrong in every one of the twenty (the longest is three minutes, the
 * shortest under two) and wrong in a way a reader can see: four different articles
 * showing one identical number reads as decoration, not as a fact. The studio sells
 * being the people who put real numbers in writing, so a made-up one is worse here
 * than none at all.
 *
 * The number is measured per article AND per language, because the same article is
 * 616 words in Spanish and 436 in Turkish — one figure could not be true for both.
 *
 * This runs before anything is built: the /blog/ index shows the time for four articles
 * that are generated after it, so the figures have to exist before the first page is
 * written. The body text is reconstructed from the source and the translation table
 * rather than from a built page, for the same reason.
 *
 * Rounded up, never down, and never below one minute — the number sets an expectation,
 * and it is better for an article to be shorter than promised than longer.
 */
const WPM = 200;
const readingTime = new Map();   // `${lang} ${path}` → minutes

for (const page of PAGES) {
  const main = page.source.match(/<main>([\s\S]*?)<\/main>/);
  if (!main) continue;                       // no article body, nothing to time
  for (const lang of ALL_LANGS) {
    const body = main[1].replace(
      /<([a-z0-9]+)[^>]*\bdata-i18n(?:-html)?="([\w]+)"[^>]*>[\s\S]*?<\/\1>/g,
      (all, tag, key) => ' ' + (translations[key] ? translations[key][lang] : '') + ' ');
    const words = stripTags(body).split(/\s+/).filter(Boolean).length;
    readingTime.set(`${lang} ${page.path}`, Math.max(1, Math.ceil(words / WPM)));
  }
}

/*
 * ── lastmod ──────────────────────────────────────────────────────────────────
 *
 * The sitemap used to stamp the build date onto all 55 URLs at once, so every rebuild
 * announced that the privacy page and four blog posts had changed today — when all that
 * had happened was the reviews cron picking up a new review on the home page. A crawler
 * told that everything changed daily stops reading the field, and then it is worth
 * nothing on the day a page genuinely does change.
 *
 * So a page's date only moves when its bytes move. Each file is compared with the copy
 * already on disk before it is overwritten; if they are identical the date carries over
 * from the previous sitemap, which is the only place it is kept. There is no second file
 * to hold dates in and therefore nothing that can fall out of step — the sitemap is its
 * own record.
 *
 * The comparison normalises line endings. Git is configured with autocrlf on this
 * machine, so a fresh checkout hands these files back with \r\n while the generator
 * writes \n; without this, the first build after a clone would call all 55 pages changed.
 */
const today = new Date().toISOString().slice(0, 10);
const SITEMAP = path.join(ROOT, 'sitemap.xml');

const prevLastmod = new Map();
if (fs.existsSync(SITEMAP)) {
  const xml = fs.readFileSync(SITEMAP, 'utf8');
  for (const m of xml.matchAll(/<loc>([^<]*)<\/loc>\s*<lastmod>([^<]*)<\/lastmod>/g))
    prevLastmod.set(m[1], m[2]);
}
const lastmod = new Map();   // URL → date, filled in by build() as each page is written

// ── per page, per language ────────────────────────────────────────────────────
function build(page, lang) {
  const t = key => translations[key][lang];
  let html = page.source;
  let swaps = 0;

  // 0. blocks only the bare domain can act on. The first-visit language router tests
  //    location.pathname and returns immediately on anything that is not '/', so on
  //    /pl/, /ru/, /tr/, /es/ and on every sub-page it was ~1.5 KB of blocking script
  //    that parsed, ran and decided nothing. Exactly one URL keeps it: the English root.
  const isBareDomain = lang === SOURCE_LANG && page.path === '';
  const rootOnly = /[ \t]*<!-- build:root-only -->\r?\n?|[ \t]*<!-- \/build:root-only -->\r?\n?/g;
  const rootOnlyBlock = /[ \t]*<!-- build:root-only -->[\s\S]*?<!-- \/build:root-only -->\r?\n?/g;
  let rootOnlyBytes = 0;
  if (isBareDomain) {
    html = html.replace(rootOnly, '');            // keep the block, drop the markers
  } else {
    rootOnlyBytes = (html.match(rootOnlyBlock) || []).reduce((n, b) => n + b.length, 0);
    html = html.replace(rootOnlyBlock, '');
  }

  // 0a. the reviews section — all of it or none of it. An empty proof block is worse than
  //     no proof block, so until reviews.json has something in it the section, its divider
  //     and its heading are cut from every generated page.
  //     The markup and its CSS are marked off separately — the CSS lives inside <style>,
  //     where an HTML comment would be shipped verbatim rather than stripped, so that half
  //     is fenced with CSS comments instead.
  // Two marked blocks now, not one: the section itself, and the rating tile in the hero.
  // Hence the global variant for removing them — the first `replace` used to take the
  // section out and leave the tile behind, claiming a rating out of an empty file.
  const rvBlock    = /[ \t]*<!-- build:reviews -->[\s\S]*?<!-- \/build:reviews -->\r?\n?/;
  const rvBlockAll = /[ \t]*<!-- build:reviews -->[\s\S]*?<!-- \/build:reviews -->\r?\n?/g;
  const rvCss   = /[ \t]*\/\* build:reviews \*\/\r?\n[\s\S]*?\/\* \/build:reviews \*\/\r?\n?/;
  let reviewsShown = 0;
  if (rvBlock.test(html)) {
    if (!shownReviews.length) {
      html = html.replace(rvBlockAll, '').replace(rvCss, '');
    } else {
      html = html.replace(/[ \t]*<!-- build:reviews -->\r?\n?|[ \t]*<!-- \/build:reviews -->\r?\n?/g, '');
      html = html.replace(/[ \t]*\/\* build:reviews \*\/\r?\n|[ \t]*\/\* \/build:reviews \*\/\r?\n?/g, '');
      html = html.replace('<div class="rv-grid" data-rv="grid"></div>',
                          `<div class="rv-grid">${reviewCards(lang)}</div>`);
      // Matched on the data-rv hook alone rather than on a class, and globally: the same
      // three numbers now appear twice on the home page — once in the reviews section and
      // once in the hero — and they are not free to disagree with each other.
      html = html.replace(/(<span[^>]*\bdata-rv="stars"[^>]*>)[^<]*(<\/span>)/g,
                          `$1${starRow(Math.round(avgRating))}$2`);
      // 4.9, but 4,9 everywhere else — the same split the vk-* rating strings already make.
      html = html.replace(/(<span[^>]*\bdata-rv="rating"[^>]*>)[^<]*(<\/span>)/g,
                          `$1${avgRating.toFixed(1).replace('.', lang === 'en' ? '.' : ',')}$2`);
      html = html.replace(/(<span[^>]*\bdata-rv="total"[^>]*>)[^<]*(<\/span>)/g,
                          `$1${REVIEWS.total || shownReviews.length}$2`);
      if (!REVIEWS.profileUrl) fail('build/reviews.json has reviews but no profileUrl to link them to');
      html = html.replace(/(<a [^>]*\bdata-rv="link"[^>]*\bhref=")[^"]*(")/g,
                          `$1${escAttr(REVIEWS.profileUrl)}$2`);
      if (html.includes('data-rv="grid"')) fail(`${page.src}: the rv-grid placeholder did not match`);
      reviewsShown = shownReviews.length;
    }
  }

  // 1. text nodes:  <p data-i18n="key">English</p>
  html = html.replace(
    /(<([a-z0-9]+)([^>]*\bdata-i18n="([\w]+)"[^>]*)>)([\s\S]*?)(<\/\2>)/g,
    (all, open, tag, attrs, key, _body, close) => {
      swaps++;
      return open + esc(t(key)) + close;
    });

  // 2. rich text:  <h2 data-i18n-html="key">English <span>with markup</span></h2>
  html = html.replace(
    /(<([a-z0-9]+)([^>]*\bdata-i18n-html="([\w]+)"[^>]*)>)([\s\S]*?)(<\/\2>)/g,
    (all, open, tag, attrs, key, _body, close) => {
      swaps++;
      return open + t(key) + close;
    });

  // 3. placeholders:  <input data-i18n-ph="key" placeholder="English">
  html = html.replace(
    /<((?:input|textarea)\b[^>]*\bdata-i18n-ph="([\w]+)"[^>]*)>/g,
    (all, attrs, key) => {
      swaps++;
      return '<' + attrs.replace(/\bplaceholder="[^"]*"/, `placeholder="${escAttr(t(key))}"`) + '>';
    });

  // 4. the two form-result messages, carried on the status node
  if (/\bdata-ok="/.test(html)) {
    html = html.replace(/\bdata-ok="[^"]*"/,  `data-ok="${escAttr(t('modalSuccess'))}"`);
    html = html.replace(/\bdata-err="[^"]*"/, `data-err="${escAttr(t('modalError'))}"`);
    swaps += 2;
  }

  // 5. document language + both language menus. The dropdown in the nav and the chips
  //    above the contact form must point at THIS page in each language, not at the home
  //    page — otherwise switching language on /product/ silently dumps you on /.
  html = html.replace(/<html lang="en">/, `<html lang="${lang}">`);
  html = html.replace(/(<span id="langDDCur">)[^<]*(<\/span>)/, `$1${lang.toUpperCase()}$2`);
  html = html.replace(/(<a role="option" data-lang="en"[^>]*?) class="active"/, '$1');
  html = html.replace(
    new RegExp(`(<a role="option" data-lang="${lang}"[^>]*?)>`), '$1 class="active">');
  html = html.replace(
    /(<a role="option" data-lang="(\w\w)" hreflang="\2" href=")[^"]*(")/g,
    (m, a, l, b) => a + href(l, page.path) + b);

  // ...and the same for the language band above the contact form. These carry no
  // role="option", so the substitutions above cannot reach them.
  html = html.replace(/(class="lang-chip) is-current(" data-lang="en")/, '$1$2');
  html = html.replace(
    new RegExp(`(class="lang-chip)(" data-lang="${lang}")`), '$1 is-current$2');
  html = html.replace(
    /(<a href=")[^"]*(" class="lang-chip[^"]*" data-lang="(\w\w)")/g,
    (m, a, b, l) => a + href(l, page.path) + b);

  // 5a. reading time. The span carries the path of the article it is timing, so the four
  //     cards on /blog/ each get their own figure rather than sharing one — and moving a
  //     card in the source moves its number with it. See ── reading time ── above.
  html = html.replace(/(<span data-read="([\w/-]*)">)[^<]*(<\/span>)/g, (all, open, p, close) => {
    const mins = readingTime.get(`${lang} ${p}`);
    if (mins == null) fail(`${page.src}: data-read="${p}" names a page that has no <main>`);
    return open + mins + close;
  });

  // 5b. cross-page links. Any <a> carrying data-page="<path>" is pointed at the current
  //     language's copy of that page — otherwise the footer's privacy link would drop a
  //     Polish reader onto the English text. Runs after the text substitutions above, so
  //     links that arrive inside a translated string are rewritten too.
  html = html.replace(/<a\b[^>]*\bdata-page="([\w/-]*)"[^>]*>/g, (tag, p) =>
    tag.replace(/\bhref="[^"]*"/, `href="${href(lang, p)}"`));

  // 6. relative asset paths — the page now lives at least one directory deeper
  html = html.replace(/(href|src)="images\//g, '$1="/images/');

  // 6b. the preloaded font subset. The source names the Latin cut, which is what four of
  //     the five languages draw their first screen with. Russian draws it with the
  //     Cyrillic cut and would otherwise spend two high-priority requests on files it
  //     never renders a glyph from, while the ones it needs queue behind them.
  if (lang === 'ru' && html.includes('<link rel="preload" as="font"')) {
    const fontRe = /(<link rel="preload" as="font"[^>]*href="\/fonts\/inter-\d00)-latin(\.woff2">)/g;
    if (!(html.match(fontRe) || []).length)
      fail(`${page.src}: font preloads present but none point at a Latin Inter cut`);
    html = html.replace(fontRe, '$1-cyrillic$2');
  }

  // 7. canonical + the hreflang set, both scoped to this page
  const alts = [SOURCE_LANG, ...LANGS]
    .map(l => `  <link rel="alternate" hreflang="${l}" href="${url(l, page.path)}">`)
    .concat(`  <link rel="alternate" hreflang="x-default" href="${url(SOURCE_LANG, page.path)}">`)
    .join('\n');
  const headRe = /  <link rel="canonical" href="[^"]*">\n(?:  <link rel="alternate"[^>]*>\n)+/;
  if (!headRe.test(html)) fail(`${page.src}: canonical + hreflang block not found`);
  html = html.replace(headRe,
    `  <link rel="canonical" href="${url(lang, page.path)}">\n${alts}\n`);

  // 8. title + descriptions. The title comes from its own key, NOT from the on-screen
  //    headline — that headline is free to be a keyword-free emotional line without
  //    dragging every search result along with it.
  const tagline = stripTags(t(page.titleKey));
  const summary = stripTags(t(page.descKey));
  const title = `OnlyMaxon — ${tagline}`;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  for (const [attr, value] of [
    ['name="description"', summary],
    ['property="og:title"', title],
    ['property="og:description"', summary],
    ['name="twitter:title"', title],
    ['name="twitter:description"', summary],
  ]) {
    const re = new RegExp(`(<meta ${attr} content=")[^"]*(">)`);
    if (!re.test(html)) fail(`${page.src}: meta ${attr} not found`);
    html = html.replace(re, `$1${escAttr(value)}$2`);
  }
  html = html.replace(/(<meta property="og:url" content=")[^"]*(">)/, `$1${url(lang, page.path)}$2`);

  // 9. structured data — description and, where the page has one, the FAQ rich result
  html = html.replace(
    /("description": ")[^"]*(",\n    "sameAs")/,
    (m, a, b) => a + summary.replace(/"/g, '\\"') + b);

  // A blog post carries BlogPosting data whose headline and description have to follow the
  // translation, or every language would be handed the English one — and an article the
  // AI engines cannot read in the visitor's language is the whole point missed.
  if (page.article) {
    for (const [field, value] of [['headline', tagline], ['description', summary]]) {
      const re = new RegExp(`("${field}": ")[^"]*(")`);
      if (!re.test(html)) fail(`${page.src}: BlogPosting "${field}" not found`);
      html = html.replace(re, `$1${value.replace(/"/g, '\\"')}$2`);
    }
    html = html.replace(/("mainEntityOfPage": ")[^"]*(")/, `$1${url(lang, page.path)}$2`);
  }

  if (page.faq) {
    // Read the questions in the order they appear on the page rather than from a
    // hard-coded list — adding a question to the source used to leave it out of the rich
    // result silently, and reordering the accordion put the two out of sync just as
    // quietly.
    const faq = page.faqOrder.map(i =>
      `      { "@type": "Question", "name": ${JSON.stringify(t('faq' + i + 'Q'))}, ` +
      `"acceptedAnswer": { "@type": "Answer", "text": ${JSON.stringify(t('faq' + i + 'A'))} } }`
    ).join(',\n');
    const faqRe = /("mainEntity": \[\n)[\s\S]*?(\n    \])/;
    if (!faqRe.test(html)) fail(`${page.src}: FAQ structured-data block not found`);
    html = html.replace(faqRe, `$1${faq}$2`);
  }

  // ── verify before writing ───────────────────────────────────────────────────
  const stillEnglish = [];
  for (const key of page.keys) {
    const en = translations[key][SOURCE_LANG];
    if (!en || en === t(key)) continue;                 // identical in both languages
    const plain = stripTags(en);
    if (plain.length > 12 && html.includes('>' + plain + '<')) stillEnglish.push(key);
  }
  if (stillEnglish.length) fail(`${lang} ${page.src}: still English after substitution: ${stillEnglish.join(', ')}`);
  if (!html.includes(`<html lang="${lang}">`)) fail(`${lang} ${page.src}: lang attribute not set`);
  if (html.includes('href="images/') || html.includes('src="images/'))
    fail(`${lang} ${page.src}: a relative image path survived`);

  // The data-i18n anchors exist so this script can find things. Once the text is baked
  // in they do nothing, so they don't get shipped.
  const anchorRe = /\sdata-i18n(?:-html|-ph)?="[\w]+"/g;
  const anchors = html.match(anchorRe) || [];
  if (!anchors.length) fail(`${lang} ${page.src}: i18n anchors vanished before substitution finished`);
  const saved = anchors.reduce((n, a) => n + a.length, 0);
  html = html.replace(anchorRe, '');
  html = html.replace(/\sdata-page="[\w/-]*"/g, '');   // build-only, same as the anchors
  html = html.replace(/\sdata-rv="[\w-]*"/g, '');      // ditto — hooks for the reviews fill
  html = html.replace(/\sdata-read="[\w/-]*"/g, '');   // ditto — hooks for the reading time

  // Last, so that everything above could still match on the comments if it needed to.
  const withComments = html.length;
  html = stripComments(html, `${lang} ${page.src}`);
  const commentBytes = withComments - html.length;

  // The source carries a header telling whoever opens it that it is the file to edit.
  // That header is now stripped along with the rest, and it would have been a lie here
  // anyway — every one of these files is overwritten on the next build.
  html = html.replace(/^<!DOCTYPE html>\n?/i,
    `<!DOCTYPE html>\n<!-- Generated from ${page.src.replace(/\\/g, '/')} by build/generate.js — do not edit. -->\n`);

  // English is the site root, the other four sit one directory down.
  const dir = path.join(ROOT, lang === SOURCE_LANG ? '' : lang, page.path);
  const file = path.join(dir, 'index.html');

  // Read before writing, or there is nothing left to compare against. See ── lastmod ──.
  const previous = fs.existsSync(file)
    ? fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')
    : null;

  // dateModified is written FROM the date decided here, so it must not take part in
  // deciding it. Left in, the page on disk would carry the stamp of the last change,
  // never match a freshly generated one, and be called changed — and therefore
  // re-stamped — on every build for the rest of its life.
  const DATE_MOD = /("dateModified": ")[^"]*(")/;
  const undated = s => s === null ? null : s.replace(DATE_MOD, '$1$2');
  const changed = undated(previous) !== undated(html);
  const loc = url(lang, page.path);
  const modified = changed ? today : (prevLastmod.get(loc) || today);
  lastmod.set(loc, modified);

  // An article that says it was last touched on the day it was written, forever, is a
  // claim that quietly stops being true the first time it is edited. Same date the
  // sitemap reports, from the same measurement, so the two can never disagree.
  if (page.article) {
    if (!DATE_MOD.test(html)) fail(`${page.src}: BlogPosting "dateModified" not found`);
    html = html.replace(DATE_MOD, `$1${modified}$2`);
  }

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, html);
  return { swaps, bytes: html.length, stripped: anchors.length, saved, commentBytes,
           rootOnlyBytes, reviewsShown, changed };
}

// ── run ───────────────────────────────────────────────────────────────────────
let changedPages = 0;
for (const page of PAGES) {
  const label = page.path ? `/${page.path}/` : '/';
  console.log(`source: ${page.src} (${(page.source.length / 1024).toFixed(1)} KB, ` +
              `${page.keys.size} keys) → ${label}\n`);
  for (const lang of ALL_LANGS) {
    const r = build(page, lang);
    if (r.changed) changedPages++;
    const out = path.join(lang === SOURCE_LANG ? '' : lang, page.path, 'index.html').replace(/\\/g, '/');
    const trimmed = r.saved + r.commentBytes + r.rootOnlyBytes;
    console.log(`  ${out.padEnd(22)} ${r.swaps} substitutions   ${(r.bytes / 1024).toFixed(1)} KB   ` +
                `(-${(trimmed / 1024).toFixed(1)} KB: ${r.commentBytes} comments, ` +
                `${r.saved} attrs${r.rootOnlyBytes ? ', ' + r.rootOnlyBytes + ' root-only' : ''})   ` +
                `${r.reviewsShown ? r.reviewsShown + ' reviews   ' : ''}` +
                `${NAMES[lang].padEnd(8)}${r.changed ? '  ← changed' : ''}`);
  }
  console.log('');
}

// ── sitemap covering every page in every language ─────────────────────────────
const entries = [];
for (const page of PAGES) {
  const alternates = [SOURCE_LANG, ...LANGS]
    .map(l => `      <xhtml:link rel="alternate" hreflang="${l}" href="${url(l, page.path)}"/>`)
    .concat(`      <xhtml:link rel="alternate" hreflang="x-default" href="${url(SOURCE_LANG, page.path)}"/>`)
    .join('\n');
  for (const lang of [SOURCE_LANG, ...LANGS]) {
    entries.push(`  <url>
    <loc>${url(lang, page.path)}</loc>
    <lastmod>${lastmod.get(url(lang, page.path)) || today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${lang === SOURCE_LANG ? page.priority.source : page.priority.translated}</priority>
${alternates}
  </url>`);
  }
}

fs.writeFileSync(SITEMAP,
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`);
console.log(`  sitemap.xml      ${entries.length} URLs, hreflang on each   ` +
            `(${changedPages ? changedPages + ' dated ' + today : 'no page changed, every date carried over'})`);
if (unused.length) console.log(`\n  note: ${unused.length} unused translation keys: ${unused.join(', ')}`);
console.log('\ndone.\n');
