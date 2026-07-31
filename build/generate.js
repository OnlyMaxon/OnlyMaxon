/*
 * Generates the translated versions of the site.
 *
 *   node build/generate.js
 *
 * index.html is the English source of truth and is never modified. For every other
 * language it emits <lang>/index.html with the text baked in, so each language is a
 * real URL that Google can crawl and rank — instead of one page rewritten by JS.
 *
 * Re-run this whenever you edit index.html or build/translations.js.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://onlymaxon.com';
const SOURCE_LANG = 'en';
const LANGS = ['pl', 'ru', 'tr', 'es'];
const NAMES = { en: 'English', pl: 'Polski', ru: 'Русский', tr: 'Türkçe', es: 'Español' };

const translations = require('./translations.js');

const fail = msg => { console.error('\n  ERROR: ' + msg + '\n'); process.exit(1); };
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = s => esc(s).replace(/"/g, '&quot;');
const stripTags = s => s.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

// ── read + validate the source ────────────────────────────────────────────────
const source = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const usedKeys = new Set();
for (const m of source.matchAll(/data-i18n(?:-html|-ph)?="([\w]+)"/g)) usedKeys.add(m[1]);
// Not carried by a data-i18n attribute: these are consumed by the build itself.
usedKeys.add('modalSuccess').add('modalError').add('metaTitle');

const missing = [];
for (const key of usedKeys) {
  if (!translations[key]) { missing.push(`${key} (no entry at all)`); continue; }
  for (const lang of LANGS) {
    if (!translations[key][lang] || !translations[key][lang].trim()) missing.push(`${key}.${lang}`);
  }
}
if (missing.length) fail(`missing translations:\n    ` + missing.join('\n    '));

const unused = Object.keys(translations).filter(k => !usedKeys.has(k));

// ── per-language build ────────────────────────────────────────────────────────
function build(lang) {
  const t = key => translations[key][lang];
  let html = source;
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
  html = html.replace(/\bdata-ok="[^"]*"/,  `data-ok="${escAttr(t('modalSuccess'))}"`);
  html = html.replace(/\bdata-err="[^"]*"/, `data-err="${escAttr(t('modalError'))}"`);
  swaps += 2;

  // 5. document language + the dropdown's own state
  html = html.replace(/<html lang="en">/, `<html lang="${lang}">`);
  html = html.replace(/(<span id="langDDCur">)[^<]*(<\/span>)/, `$1${lang.toUpperCase()}$2`);
  html = html.replace(/(<a role="option" data-lang="en"[^>]*?) class="active"/, '$1');
  html = html.replace(
    new RegExp(`(<a role="option" data-lang="${lang}"[^>]*?)>`), '$1 class="active">');

  // 6. relative asset paths — the page now lives one directory deep
  html = html.replace(/(href|src)="images\//g, '$1="/images/');

  // 7. canonical for this language (hreflang block is identical on every page)
  html = html.replace(
    /<link rel="canonical" href="[^"]*">/,
    `<link rel="canonical" href="${SITE}/${lang}/">`);

  // 8. title + descriptions. The title comes from its own key, NOT from heroTitle —
  //    the on-screen headline is free to be a keyword-free emotional line without
  //    dragging every search result along with it.
  const tagline = stripTags(t('metaTitle'));
  const summary = stripTags(t('heroSub'));
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
    if (!re.test(html)) fail(`meta ${attr} not found`);
    html = html.replace(re, `$1${escAttr(value)}$2`);
  }
  html = html.replace(/(<meta property="og:url" content=")[^"]*(">)/, `$1${SITE}/${lang}/$2`);

  // 9. structured data — description and the FAQ rich result, translated
  html = html.replace(
    /("description": ")[^"]*(",\n    "sameAs")/,
    (m, a, b) => a + summary.replace(/"/g, '\\"') + b);

  const faq = [1, 2, 3, 4, 5].map(i =>
    `      { "@type": "Question", "name": ${JSON.stringify(t('faq' + i + 'Q'))}, ` +
    `"acceptedAnswer": { "@type": "Answer", "text": ${JSON.stringify(t('faq' + i + 'A'))} } }`
  ).join(',\n');
  const faqRe = /("mainEntity": \[\n)[\s\S]*?(\n    \])/;
  if (!faqRe.test(html)) fail('FAQ structured-data block not found');
  html = html.replace(faqRe, `$1${faq}$2`);

  // ── verify before writing ───────────────────────────────────────────────────
  const stillEnglish = [];
  for (const key of usedKeys) {
    const en = translations[key][SOURCE_LANG];
    if (!en || en === t(key)) continue;                 // identical in both languages
    const plain = stripTags(en);
    if (plain.length > 12 && html.includes('>' + plain + '<')) stillEnglish.push(key);
  }
  if (stillEnglish.length) fail(`${lang}: still English after substitution: ${stillEnglish.join(', ')}`);
  if (!html.includes(`<html lang="${lang}">`)) fail(`${lang}: lang attribute not set`);
  if (html.includes('href="images/') || html.includes('src="images/'))
    fail(`${lang}: a relative image path survived`);

  // The data-i18n anchors exist so this script can find things. Once the text is baked
  // in they do nothing, so they don't get shipped.
  const anchorRe = /\sdata-i18n(?:-html|-ph)?="[\w]+"/g;
  const anchors = html.match(anchorRe) || [];
  if (!anchors.length) fail(`${lang}: i18n anchors vanished before substitution finished`);
  const saved = anchors.reduce((n, a) => n + a.length, 0);
  html = html.replace(anchorRe, '');

  const dir = path.join(ROOT, lang);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  return { swaps, bytes: html.length, stripped: anchors.length, saved };
}

// ── run ───────────────────────────────────────────────────────────────────────
console.log(`source: index.html (${(source.length / 1024).toFixed(1)} KB, ${usedKeys.size} keys)\n`);
for (const lang of LANGS) {
  const r = build(lang);
  console.log(`  ${lang}/index.html   ${r.swaps} substitutions   ${(r.bytes / 1024).toFixed(1)} KB   ` +
              `(-${r.stripped} build-only attrs, -${r.saved} B)   ${NAMES[lang]}`);
}

// ── sitemap covering every language ───────────────────────────────────────────
const today = new Date().toISOString().slice(0, 10);
const urls = [`${SITE}/`, ...LANGS.map(l => `${SITE}/${l}/`)];
const alternates = [SOURCE_LANG, ...LANGS]
  .map(l => `      <xhtml:link rel="alternate" hreflang="${l}" href="${l === SOURCE_LANG ? SITE + '/' : `${SITE}/${l}/`}"/>`)
  .concat(`      <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/"/>`)
  .join('\n');

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map(u => `  <url>
    <loc>${u}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${u === SITE + '/' ? '1.0' : '0.9'}</priority>
${alternates}
  </url>`).join('\n')}
</urlset>
`);
console.log(`\n  sitemap.xml      ${urls.length} URLs, hreflang on each`);
if (unused.length) console.log(`\n  note: ${unused.length} unused translation keys: ${unused.join(', ')}`);
console.log('\ndone.\n');
