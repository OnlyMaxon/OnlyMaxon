/*
 * The page an NFC card opens.
 *
 * Called at the end of build/generate.js. Reads build/profiles.json and writes, per entry:
 *
 *   u/<slug>/index.html    one screen: who, what, three buttons
 *   u/<slug>/contact.vcf   what the "save contact" button hands to the phone
 *
 * Deliberately NOT part of the PAGES pipeline in generate.js, for three reasons that all
 * point the same way:
 *
 *   - One page per client, not five. A profile carries somebody's own name and phone;
 *     translating that into Turkish is meaningless, and the five-language key check would
 *     block every order until it was done anyway.
 *   - noindex, and therefore no sitemap entry and no hreflang. A directory of near-identical
 *     one-screen pages is the textbook shape of thin content, and Google would take that out
 *     on the whole domain rather than on these pages.
 *   - Its own stylesheet, ~6 KB against the home page's 104. This page is opened by someone
 *     standing outside holding a stranger's phone on mobile data, which is the worst
 *     connection any page of this site will ever see. Nothing renders before the HTML lands,
 *     so it carries no webfont either: the system stack draws instantly at any speed.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://onlymaxon.com';
const DIR = 'u';

/*
 * Where "made by OnlyMaxon" points. The visitor has just experienced the product, so the
 * honest destination is the page that sells it — but /nfc/ does not exist yet and a credit
 * link into a 404 is worse than one to the home page. One edit the day that page ships.
 */
const CREDIT_HREF = '/';

const LANGS = ['en', 'pl', 'ru', 'tr', 'es'];

// The only translated strings on the page: everything else is typed into profiles.json in
// whatever language the client speaks. Kept here rather than in build/translations.js so
// that adding a client never touches the table the fourteen real pages are built from.
const LABELS = {
  call:   { en: 'Call',         pl: 'Zadzwoń',      ru: 'Позвонить',          tr: 'Ara',            es: 'Llamar' },
  write:  { en: 'Message',      pl: 'Napisz',       ru: 'Написать',           tr: 'Yaz',            es: 'Escribir' },
  save:   { en: 'Save contact', pl: 'Zapisz kontakt', ru: 'Сохранить контакт', tr: 'Kişiyi kaydet', es: 'Guardar contacto' },
  credit: { en: 'Made by OnlyMaxon', pl: 'Zrobione przez OnlyMaxon', ru: 'Сделано в OnlyMaxon', tr: 'OnlyMaxon yapımı', es: 'Hecho por OnlyMaxon' },
};

/*
 * "studio" is the site's own palette, lifted straight from :root in build/src/index.html —
 * --blue, --purple, --bg, --bg2, --text, --text-d. It is the default, so a card that says
 * nothing about colour comes out looking like the rest of OnlyMaxon, and the logo (a silver
 * M with a cyan arrow on near-black) sits on its own background rather than on a stranger's.
 * The other three exist for clients: a barber's card should carry the barber's colour, not
 * the studio's. They are the same colourways as the phone mocks on the home page.
 */
const ACCENTS = {
  studio:{ a: '#22D3EE', d: '#2C8A9C', on: '#04141A', s1: '#06080C', s2: '#0B0F16', ink: '#EAF2F6', mut: '#93A6B2' },
  amber: { a: '#E7B45A', d: '#C8922F', on: '#1a1509', s1: '#100E0A', s2: '#1A150E', ink: '#F4EEE4', mut: '#B0A493' },
  rose:  { a: '#E9A5BC', d: '#C0687F', on: '#1e0d13', s1: '#120A0E', s2: '#1C1016', ink: '#F6EAEF', mut: '#B39AA3' },
  cyan:  { a: '#7FE9F0', d: '#2C8A9C', on: '#04141A', s1: '#08111A', s2: '#0D1A24', ink: '#E6F4F7', mut: '#93AAB3' },
};

const fail = msg => { console.error('\n  ERROR: ' + msg + '\n'); process.exit(1); };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = s => esc(s).replace(/"/g, '&quot;');

// tel: wants no spaces; the number is written with them everywhere a human reads it,
// because Google matches the studio's NAP as a string and one unspaced copy is a
// different business to it.
const dial = s => s.replace(/[^\d+]/g, '');

const initials = name =>
  name.trim().split(/\s+/).slice(0, 2).map(w => [...w][0]).join('').toUpperCase();

// #E7B45A → "231,180,90", so the accent can be reused at low opacity for the glow behind
// the avatar without a second colour having to be picked and kept in step with it.
const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(',');

/*
 * vCard 3.0, not 4.0: 3.0 is what iOS and Android both read without argument, and this
 * file is only ever opened by a phone. RFC 2426 wants CRLF between lines — plenty of
 * parsers forgive LF, but the ones that don't fail silently, on somebody else's phone,
 * where nobody would ever see it.
 */
const vEsc = s => String(s).replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\r?\n/g, '\\n');

function vcard(p) {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:;${vEsc(p.name)};;;`,
    `FN:${vEsc(p.name)}`,
    `TITLE:${vEsc(p.role)}`,
    `TEL;TYPE=CELL:${dial(p.phone)}`,
  ];
  if (p.email) lines.push(`EMAIL;TYPE=INTERNET:${vEsc(p.email)}`);
  if (p.website) lines.push(`URL:${vEsc(p.website)}`);
  if (p.bio) lines.push(`NOTE:${vEsc(p.bio)}`);
  // Where the contact came from, so it is still obvious a year later.
  lines.push(`SOURCE:${SITE}/${DIR}/${p.slug}/`);
  lines.push('END:VCARD');
  return lines.join('\r\n') + '\r\n';
}

function css(c) {
  return `
*{margin:0;padding:0;box-sizing:border-box}
:root{--a:${c.a};--d:${c.d};--on:${c.on};--ink:${c.ink};--mut:${c.mut}}
/* The page background belongs on <html>, not only on <body>. Painted on the body alone it
   stops at the body box, and everything outside it — the rubber-band area a phone shows
   when you drag past the end, and the scrollbar track on a desktop — falls back to the
   browser's own white. "fixed" sizes the gradient to the viewport so both ends of an
   overscroll stay dark; color-scheme tells the browser the rest of its chrome is dark too. */
html{
  -webkit-text-size-adjust:100%;color-scheme:dark;
  background:linear-gradient(180deg,${c.s1},${c.s2}) ${c.s1} fixed;
}
body{
  min-height:100vh;padding:34px 20px 26px;
  /* The accent, very faint, pooled behind the avatar. One gradient, no image: the flat
     panel it replaces read as a form rather than as somebody's card. */
  background:radial-gradient(60% 42% at 50% 6%,rgba(${rgb(c.a)},.14),transparent 72%);
  color:var(--ink);
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;
  font-size:15px;line-height:1.5;text-align:center;
  display:flex;align-items:center;justify-content:center;
}
.card{width:100%;max-width:400px}
.ava{
  width:82px;height:82px;border-radius:50%;margin:0 auto 16px;overflow:hidden;
  background:linear-gradient(140deg,var(--a),var(--d));color:var(--on);
  display:flex;align-items:center;justify-content:center;
  font-size:34px;font-weight:700;letter-spacing:-.5px;
  box-shadow:0 10px 30px rgba(${rgb(c.a)},.22);
}
/* A logo usually sits in its own padding, a face does not — so the zoom is per profile.
   The disc loses its gradient here: behind a photo it would only show as a rim. */
.ava.pic{background:${c.s1};box-shadow:0 10px 30px rgba(0,0,0,.45),0 0 0 1px rgba(255,255,255,.07)}
.ava img{width:100%;height:100%;object-fit:cover;display:block}
h1{font-size:27px;font-weight:700;letter-spacing:-.4px;line-height:1.15}
.role{color:var(--a);font-size:12px;font-weight:600;letter-spacing:.7px;text-transform:uppercase;margin-top:6px}
.loc{color:var(--mut);font-size:13px;margin-top:8px}
.bio{color:var(--mut);font-size:14px;margin-top:14px}
.srv{list-style:none;margin-top:22px}
.srv li{
  display:flex;justify-content:space-between;align-items:center;gap:12px;
  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);
  border-radius:11px;padding:11px 14px;margin-bottom:8px;font-size:14px;text-align:left;
}
.srv b{color:var(--a);white-space:nowrap;font-weight:600}
.btns{margin-top:24px;display:flex;flex-direction:column;gap:9px}
.btn{
  display:block;padding:14px;border-radius:12px;font-size:15px;font-weight:700;
  text-decoration:none;background:linear-gradient(135deg,var(--a),var(--d));color:var(--on);
  box-shadow:0 8px 22px rgba(${rgb(c.a)},.20);transition:transform .12s ease;
}
.btn2{background:none;border:1px solid var(--a);color:var(--a);box-shadow:none}
.btn3{background:none;border:1px solid rgba(255,255,255,.14);color:var(--ink);box-shadow:none}
/* Touch has no hover, so a button that does not visibly react to a press reads as broken
   for the half-second before the phone acts on it. */
.btn:active{transform:scale(.975)}
.lnk{list-style:none;margin-top:18px;display:flex;flex-wrap:wrap;gap:8px 18px;justify-content:center}
.lnk a{color:var(--mut);font-size:13px;text-decoration:none;border-bottom:1px solid rgba(255,255,255,.12)}
.credit{
  display:inline-block;margin-top:30px;color:var(--mut);font-size:11px;
  letter-spacing:1.1px;text-transform:uppercase;text-decoration:none;
}
.credit:hover,.lnk a:hover{color:var(--a)}
/* The page arrives all at once because it is 5 KB — which made it land like a printout.
   A short stagger reads as it assembling itself, and costs no request and no script. */
@keyframes in{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:none}}
.card>*{animation:in .45s cubic-bezier(.2,.7,.3,1) both}
.card>*:nth-child(2){animation-delay:.05s}
.card>*:nth-child(3){animation-delay:.09s}
.card>*:nth-child(4){animation-delay:.13s}
.card>*:nth-child(5){animation-delay:.17s}
.card>*:nth-child(6){animation-delay:.21s}
.card>*:nth-child(7){animation-delay:.25s}
.card>*:nth-child(n+8){animation-delay:.29s}
@media(prefers-reduced-motion:reduce){.card>*{animation:none}.btn{transition:none}}
@media(min-width:520px){body{padding:56px 20px}h1{font-size:30px}}
// The reasoning above is for whoever opens this file, not for the phone downloading the
// page — the same call generate.js makes when it strips the comments out of the other
// fourteen. Blank lines left behind by the strip go with them.
`.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*/g, '\n').replace(/\n+/g, '\n').trim();
}

/*
 * The page itself. Two decisions worth knowing before editing it:
 *
 *   noindex — a directory of one-screen pages carrying other people's phone numbers is
 *   neither something Google should rank (it is the textbook shape of thin content, and
 *   the penalty lands on the whole domain) nor something the privacy page promises to
 *   publish. But follow, not nofollow: the credit link at the bottom is meant to count.
 *
 *   No webfont, no script, no comment in the output — see the header of this file.
 */
function page(p) {
  const L = k => LABELS[k][p.lang];
  const title = `${p.name} — ${p.role}`;
  const desc = p.bio || `${p.name} · ${p.role}`;
  const here = `${SITE}/${DIR}/${p.slug}/`;

  const services = (p.services || []).length ? `
    <ul class="srv">
${p.services.map(s => `      <li><span>${esc(s.name)}</span><b>${esc(s.price)}</b></li>`).join('\n')}
    </ul>` : '';

  const links = (p.links || []).length ? `
    <ul class="lnk">
${p.links.map(l => `      <li><a href="${escAttr(l.url)}" rel="noopener">${esc(l.label)}</a></li>`).join('\n')}
    </ul>` : '';

  // A photo, or the initial. The initial is not a placeholder waiting to be replaced —
  // it is what a client with no usable picture should ship with, and it looks deliberate.
  // object-position cannot help here: a square image in a square box under object-fit:cover
  // has no overflow to reposition. So the centring is done in the transform, and it has to
  // happen BEFORE the scale — the rightmost function applies first — or the zoom multiplies
  // the offset instead of leaving it alone.
  const [fx, fy] = p.photoFocus || [50, 50];
  const moves = [];
  if (p.photoScale && p.photoScale !== 1) moves.push(`scale(${p.photoScale})`);
  if (fx !== 50 || fy !== 50) moves.push(`translate(${(50 - fx).toFixed(1)}%,${(50 - fy).toFixed(1)}%)`);
  const zoom = moves.length ? ` style="transform:${moves.join(' ')}"` : '';
  const avatar = p.photo
    ? `<div class="ava pic"><img src="${escAttr(p.photo)}" alt="${escAttr(p.name)}" width="82" height="82"${zoom}></div>`
    : `<div class="ava" aria-hidden="true">${esc(initials(p.name))}</div>`;

  const write = p.email
    ? `      <a class="btn btn2" href="mailto:${escAttr(p.email)}">${esc(L('write'))}</a>\n`
    : '';

  return `<!DOCTYPE html>
<!-- Generated from build/profiles.json by build/profiles.js — do not edit. -->
<html lang="${p.lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${escAttr(desc)}">
  <meta name="robots" content="noindex, follow">
  <link rel="canonical" href="${here}">
  <meta property="og:type" content="profile">
  <meta property="og:title" content="${escAttr(title)}">
  <meta property="og:description" content="${escAttr(desc)}">
  <meta property="og:url" content="${here}">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <style>
${css(ACCENTS[p.accent || 'studio'])}
  </style>
</head>
<body>
  <main class="card">
    ${avatar}
    <h1>${esc(p.name)}</h1>
    <p class="role">${esc(p.role)}</p>
${p.location ? `    <p class="loc">${esc(p.location)}</p>\n` : ''}${p.bio ? `    <p class="bio">${esc(p.bio)}</p>\n` : ''}${services}
    <div class="btns">
      <a class="btn" href="tel:${escAttr(dial(p.phone))}">${esc(L('call'))}</a>
${write}      <a class="btn btn3" href="contact.vcf" download="${escAttr(p.slug)}.vcf">${esc(L('save'))}</a>
    </div>${links}
    <a class="credit" href="${CREDIT_HREF}">${esc(L('credit'))}</a>
  </main>
</body>
</html>
`;
}

// Checked here rather than at render time: a missing field would otherwise print the word
// "undefined" onto a card that has already been posted to a client.
function validate(p, i) {
  const at = `build/profiles.json entry #${i + 1}`;
  if (!/^[a-z0-9][a-z0-9-]*$/.test(p.slug || ''))
    fail(`${at}: "slug" must be lowercase letters, digits and dashes — got ${JSON.stringify(p.slug)}`);
  if (!LANGS.includes(p.lang)) fail(`${at} (${p.slug}): "lang" must be one of ${LANGS.join(', ')}`);
  for (const field of ['name', 'role', 'phone'])
    if (!p[field] || !String(p[field]).trim()) fail(`${at} (${p.slug}): "${field}" is required`);
  if (!/^\+\d[\d ]{6,}$/.test(p.phone))
    fail(`${at} (${p.slug}): "phone" must be international and start with + — got ${JSON.stringify(p.phone)}`);
  if (p.photo && !/^(\/|https?:\/\/)/.test(p.photo))
    fail(`${at} (${p.slug}): "photo" must start with / or http — got ${JSON.stringify(p.photo)}`);
  if (p.photoScale != null && !(typeof p.photoScale === 'number' && p.photoScale >= 1 && p.photoScale <= 4))
    fail(`${at} (${p.slug}): "photoScale" must be a number between 1 and 4`);
  if (p.photoScale != null && !p.photo)
    fail(`${at} (${p.slug}): "photoScale" without a "photo" does nothing`);
  if (p.photoFocus != null) {
    if (!p.photo) fail(`${at} (${p.slug}): "photoFocus" without a "photo" does nothing`);
    const ok = Array.isArray(p.photoFocus) && p.photoFocus.length === 2 &&
               p.photoFocus.every(n => typeof n === 'number' && n >= 0 && n <= 100);
    if (!ok) fail(`${at} (${p.slug}): "photoFocus" must be two numbers 0-100, e.g. [52.3, 43.6]`);
  }
  if (p.accent && !ACCENTS[p.accent])
    fail(`${at} (${p.slug}): "accent" must be one of ${Object.keys(ACCENTS).join(', ')}`);
  for (const s of p.services || [])
    if (!s.name || !s.price) fail(`${at} (${p.slug}): every service needs a name and a price`);
  for (const l of p.links || [])
    if (!l.label || !/^https?:\/\//.test(l.url || '')) fail(`${at} (${p.slug}): every link needs a label and a full URL`);
}

function build() {
  const file = path.join(__dirname, 'profiles.json');
  if (!fs.existsSync(file)) return;

  const profiles = (JSON.parse(fs.readFileSync(file, 'utf8')).profiles || []);
  if (!profiles.length) return;

  const seen = new Set();
  profiles.forEach((p, i) => {
    validate(p, i);
    // Two cards pointing at one URL is a bug that only shows up as a client opening
    // somebody else's page.
    if (seen.has(p.slug)) fail(`build/profiles.json: two entries share the slug "${p.slug}"`);
    seen.add(p.slug);
  });

  console.log(`source: build/profiles.json (${profiles.length} profile${profiles.length > 1 ? 's' : ''}) → /u/\n`);

  for (const p of profiles) {
    const dir = path.join(ROOT, DIR, p.slug);
    fs.mkdirSync(dir, { recursive: true });
    const html = page(p);
    const vcf = vcard(p);
    fs.writeFileSync(path.join(dir, 'index.html'), html);
    fs.writeFileSync(path.join(dir, 'contact.vcf'), vcf);
    console.log(`  ${(DIR + '/' + p.slug + '/').padEnd(22)} ${(html.length / 1024).toFixed(1)} KB   ` +
                `+ contact.vcf ${vcf.length} B   ${p.lang}   noindex, not in sitemap`);
  }
  console.log('');
}

module.exports = { build };
