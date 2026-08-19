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

const ROOT = path.join(__dirname, '..');
const SITE = 'https://onlymaxon.com';
const SOURCE_LANG = 'en';
const LANGS = ['pl', 'ru', 'tr', 'es'];
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

// Where a page lives, as a root-relative href and as an absolute URL. The source
// language sits at the top level (/, /product/), the rest one directory deeper.
const href = (lang, p) => '/' + (lang === SOURCE_LANG ? '' : lang + '/') + (p ? p + '/' : '');
const url  = (lang, p) => SITE + href(lang, p);

// ── read + validate every source ──────────────────────────────────────────────
// Normalise to LF. Git is configured to check files out with CRLF on this machine, so
// after any `git checkout index.html` the source comes back with \r\n — and the
// structured-data patterns below, which match on \n, silently stop matching.
for (const page of PAGES) {
  page.src = path.join(page.path, 'index.html');
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

const missing = [];
for (const key of usedKeys) {
  if (!translations[key]) { missing.push(`${key} (no entry at all)`); continue; }
  for (const lang of LANGS) {
    if (!translations[key][lang] || !translations[key][lang].trim()) missing.push(`${key}.${lang}`);
  }
}
if (missing.length) fail(`missing translations:\n    ` + missing.join('\n    '));

const unused = Object.keys(translations).filter(k => !usedKeys.has(k));

// ── per page, per language ────────────────────────────────────────────────────
function build(page, lang) {
  const t = key => translations[key][lang];
  let html = page.source;
  let swaps = 0;

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

  // 5b. cross-page links. Any <a> carrying data-page="<path>" is pointed at the current
  //     language's copy of that page — otherwise the footer's privacy link would drop a
  //     Polish reader onto the English text. Runs after the text substitutions above, so
  //     links that arrive inside a translated string are rewritten too.
  html = html.replace(/<a\b[^>]*\bdata-page="([\w/-]*)"[^>]*>/g, (tag, p) =>
    tag.replace(/\bhref="[^"]*"/, `href="${href(lang, p)}"`));

  // 6. relative asset paths — the page now lives at least one directory deeper
  html = html.replace(/(href|src)="images\//g, '$1="/images/');

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

  const dir = path.join(ROOT, lang, page.path);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  return { swaps, bytes: html.length, stripped: anchors.length, saved };
}

// ── run ───────────────────────────────────────────────────────────────────────
for (const page of PAGES) {
  const label = page.path ? `/${page.path}/` : '/';
  console.log(`source: ${page.src} (${(page.source.length / 1024).toFixed(1)} KB, ` +
              `${page.keys.size} keys) → ${label}\n`);
  for (const lang of LANGS) {
    const r = build(page, lang);
    const out = path.join(lang, page.path, 'index.html').replace(/\\/g, '/');
    console.log(`  ${out.padEnd(22)} ${r.swaps} substitutions   ${(r.bytes / 1024).toFixed(1)} KB   ` +
                `(-${r.stripped} build-only attrs, -${r.saved} B)   ${NAMES[lang]}`);
  }
  console.log('');
}

// ── sitemap covering every page in every language ─────────────────────────────
const today = new Date().toISOString().slice(0, 10);
const entries = [];
for (const page of PAGES) {
  const alternates = [SOURCE_LANG, ...LANGS]
    .map(l => `      <xhtml:link rel="alternate" hreflang="${l}" href="${url(l, page.path)}"/>`)
    .concat(`      <xhtml:link rel="alternate" hreflang="x-default" href="${url(SOURCE_LANG, page.path)}"/>`)
    .join('\n');
  for (const lang of [SOURCE_LANG, ...LANGS]) {
    entries.push(`  <url>
    <loc>${url(lang, page.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${lang === SOURCE_LANG ? page.priority.source : page.priority.translated}</priority>
${alternates}
  </url>`);
  }
}

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`);
console.log(`  sitemap.xml      ${entries.length} URLs, hreflang on each`);
if (unused.length) console.log(`\n  note: ${unused.length} unused translation keys: ${unused.join(', ')}`);
console.log('\ndone.\n');
