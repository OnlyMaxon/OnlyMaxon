/*
 * The E-GAMES sign-up page — onlymaxon.com/e-games/
 *
 * Written for one evening: the university's club day, where the yOdin promo runs on a
 * screen and a printed poster stands beside it. The poster carries a QR code and this
 * short address; a student scans it, types a name and a student code, and that is the
 * whole interaction. Nothing else on the page may get in the way of those two fields.
 *
 * Called at the end of build/generate.js and writes e-games/index.html. Outside the
 * 14-page × 5-language pipeline for the same reasons as /u/ and /apps/: one language, one
 * page, noindex — a sign-up form for a single evening has no business in search results,
 * and it carries personal data of people who never agreed to be indexed.
 *
 * It wears yOdin's colours, not the studio's, because the poster and the video beside it
 * are yOdin's and a student who scans the code must land somewhere that looks like what
 * they just watched.
 *
 * WHY IT HAS JAVASCRIPT when nearly every other page here does not: the form writes
 * straight to Firestore. There is no server on this domain, and for one evening a
 * Cloudflare Worker in front of a database is more moving parts than the job deserves.
 * The protection is in the rules, not in the page — see FIRESTORE RULES below, which must
 * be pasted into the console or anybody can write anything into the collection.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://onlymaxon.com';
const DIR = 'e-games';

const EVENT = {
  name: 'E-GAMES',
  kicker: 'University E-Sport',
  blurb: 'Register for the tournament. Two fields, ten seconds.',
  collection: 'egames',
};

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * THE FIREBASE WEB CONFIG FOR THE NEW `onlymaxon` PROJECT GOES HERE.
 *
 * Max created the project and the Firestore database on 2026-10-11 and has not sent the
 * config yet. Until the three fields below are filled in, the page builds and renders
 * perfectly but the Save button reports that sign-up is not open — deliberately, because
 * a form that silently drops what a student typed is worse than a form that says no.
 *
 * Firebase console → Project settings → General → Your apps → Web app → SDK setup.
 * Only these three fields are needed; databaseURL, storageBucket, messagingSenderId and
 * appId belong to products this page never touches.
 *
 * The apiKey is public by design — it names the project, it authorises nothing, and the
 * rules below are what actually protect the data. Same reasoning as the yOdin auth
 * handler, and the same reason this is said out loud here rather than only in a comment.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const FIREBASE = {
  apiKey: '',
  authDomain: '',
  projectId: '',
};

const SDK = '12.19.0';

/*
 * FIRESTORE RULES — paste these into Firebase console → Firestore → Rules.
 *
 * The page writes with the student code as the document id, so the database itself
 * enforces one registration per code: a second attempt is a write to an existing document,
 * which `allow create` refuses, and the page turns that refusal into "already registered"
 * rather than an error.
 *
 * Nothing can be read, changed or deleted from a browser. The list is visible only in the
 * console, which is correct: these are students' names and codes, and the page that
 * collects them has no business being able to hand them back out.
 *
 *   rules_version = '2';
 *   service cloud.firestore {
 *     match /databases/{database}/documents {
 *       match /egames/{code} {
 *         allow create: if request.resource.data.keys().hasOnly(['name','studentCode','createdAt'])
 *                       && request.resource.data.name is string
 *                       && request.resource.data.name.size() >= 2
 *                       && request.resource.data.name.size() <= 60
 *                       && request.resource.data.studentCode == code
 *                       && code.matches('^[A-Za-z0-9-]{3,20}$')
 *                       && request.resource.data.createdAt == request.time;
 *         allow read, update, delete: if false;
 *       }
 *     }
 *   }
 */

const LATIN =
  'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, ' +
  'U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, ' +
  'U+FEFF, U+FFFD';

const fonts = [400, 600, 700]
  .map(w => `    @font-face { font-family: 'Inter'; font-style: normal; font-weight: ${w}; font-display: swap;
                 src: url(/fonts/inter-${w}-latin.woff2) format('woff2');
                 unicode-range: ${LATIN}; }`)
  .join('\n');

function page() {
  const live = Boolean(FIREBASE.apiKey && FIREBASE.projectId);

  return `<!DOCTYPE html>
<!--
  GENERATED — edit build/event.js, not this file, then run:

      node build/generate.js

  The E-GAMES sign-up page. The Firestore rules that protect the collection are written
  out in build/event.js; without them pasted into the console, the collection is open.
-->
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>${EVENT.name} — ${EVENT.kicker}</title>
  <meta name="description" content="Sign up for the ${EVENT.name} university e-sport tournament.">
  <!-- A sign-up form holding students' names has no place in search results. -->
  <meta name="robots" content="noindex, nofollow">
  <meta name="referrer" content="no-referrer">
  <meta name="theme-color" content="#2B1259">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="apple-touch-icon" href="/images/yodin/icon-180.png">
  <link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/inter-700-latin.woff2">
  <link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/inter-400-latin.woff2">
  <style>
${fonts}
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --violet: #6C35DE; --violet-l: #8B5CF6;
      --card: #171029; --field: #1F1736; --rule: #352a52;
      --text: #F3F0FB; --dim: #A99BD4; --ok: #34D399; --bad: #FF8A8A;
    }
    html, body { min-height: 100%; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: var(--text); background: #120B24;
      display: flex; align-items: center; justify-content: center;
      padding: 28px 20px calc(28px + env(safe-area-inset-bottom));
      min-height: 100vh; min-height: 100dvh;
      -webkit-font-smoothing: antialiased; position: relative; overflow-x: hidden;
    }
    /* Two soft lights, the same ones the promo video and the store shots carry. */
    body::before, body::after {
      content: ''; position: fixed; border-radius: 50%; filter: blur(130px);
      pointer-events: none; z-index: 0;
    }
    body::before { width: 620px; height: 620px; background: #6C35DE; opacity: .55;
                   top: -240px; left: -200px; }
    body::after  { width: 560px; height: 560px; background: #8B5CF6; opacity: .40;
                   bottom: -260px; right: -180px; }

    .card {
      position: relative; z-index: 1; width: 100%; max-width: 440px;
      background: var(--card); border-radius: 26px; padding: 34px 30px 30px;
      box-shadow: 0 30px 80px rgba(8, 3, 24, .6), inset 0 0 0 1px rgba(255,255,255,.07);
    }
    .brand { display: flex; align-items: center; gap: 11px; }
    .brand img { width: 32px; height: 32px; border-radius: 9px; display: block; }
    .brand b { font-size: 18px; font-weight: 700; letter-spacing: -.02em; }

    h1 { font-size: clamp(42px, 13vw, 56px); font-weight: 700; letter-spacing: -.045em;
         line-height: .98; margin-top: 24px;
         background: linear-gradient(135deg, #C9B4FF 0%, #FFFFFF 55%, #C9B4FF 100%);
         -webkit-background-clip: text; background-clip: text; color: transparent; }
    .kicker { font-size: 15px; font-weight: 600; letter-spacing: .14em;
              text-transform: uppercase; color: #B49BFF; margin-top: 12px; }
    .blurb { font-size: 16px; line-height: 1.5; color: var(--dim); margin-top: 14px; }

    form { margin-top: 26px; display: grid; gap: 14px; }
    label { display: block; font-size: 13px; font-weight: 600; color: var(--dim);
            margin-bottom: 7px; letter-spacing: .01em; }
    input {
      width: 100%; font: inherit; font-size: 17px; color: var(--text);
      background: var(--field); border: 1px solid var(--rule); border-radius: 14px;
      padding: 15px 16px; outline: none;
      transition: border-color .15s ease, box-shadow .15s ease;
    }
    input::placeholder { color: #6E6193; }
    input:focus { border-color: var(--violet-l);
                  box-shadow: 0 0 0 4px rgba(139, 92, 246, .22); }
    /* The student code is digits in practice, so phones should open the number pad —
       but the field stays text so a code with a letter in it is not silently rejected. */
    #code { letter-spacing: .06em; }

    button {
      margin-top: 6px; width: 100%; font: inherit; font-size: 17px; font-weight: 600;
      color: #fff; border: 0; border-radius: 14px; padding: 16px; cursor: pointer;
      background: linear-gradient(135deg, #6C35DE 0%, #8B5CF6 100%);
      box-shadow: 0 10px 26px rgba(108, 53, 222, .45);
      transition: filter .15s ease, transform .08s ease;
    }
    button:hover { filter: brightness(1.07); }
    button:active { transform: translateY(1px); }
    button:disabled { filter: grayscale(.5) brightness(.75); cursor: default;
                      box-shadow: none; }

    .note { margin-top: 16px; font-size: 13px; line-height: 1.5; color: #8678B0; }
    .note a { color: #BBA6F5; }
    .msg { margin-top: 14px; font-size: 15px; line-height: 1.45; display: none; }
    .msg.bad { color: var(--bad); display: block; }

    /* ── the state after a successful sign-up ─────────────────────────────── */
    .done { display: none; text-align: center; padding: 10px 0 4px; }
    .done.on { display: block; }
    .done svg { width: 62px; height: 62px; margin: 0 auto 18px; display: block; }
    .done h2 { font-size: 30px; font-weight: 700; letter-spacing: -.03em; }
    .done p { margin-top: 10px; font-size: 16px; line-height: 1.5; color: var(--dim); }
    .who { margin-top: 18px; display: inline-block; font-size: 15px; font-weight: 600;
           padding: 11px 18px; border-radius: 999px; background: var(--field);
           box-shadow: inset 0 0 0 1px var(--rule); }
    @media (prefers-reduced-motion: no-preference) {
      .done.on svg { animation: pop .4s cubic-bezier(.2,1.4,.4,1) both; }
      @keyframes pop { from { transform: scale(.5); opacity: 0 } to { transform: none; opacity: 1 } }
    }
  </style>
</head>
<body>
  <main class="card">
    <div class="brand">
      <img src="/images/yodin/icon-180.png" alt="" width="180" height="180">
      <b>yOdin</b>
    </div>

    <div id="form-view">
      <h1>${EVENT.name}</h1>
      <div class="kicker">${EVENT.kicker}</div>
      <p class="blurb">${EVENT.blurb}</p>

      <form id="f" novalidate>
        <div>
          <label for="name">Your name</label>
          <input id="name" name="name" type="text" autocomplete="name"
                 placeholder="Max" maxlength="60" required>
        </div>
        <div>
          <label for="code">Student code</label>
          <input id="code" name="code" type="text" inputmode="numeric"
                 autocomplete="off" placeholder="73743" maxlength="20" required>
        </div>
        <button id="go" type="submit">Register</button>
      </form>

      <p id="msg" class="msg"></p>
      <p class="note">One entry per student code. We keep your name and code for the
        tournament and nothing else — see the
        <a href="/privacy/">privacy policy</a>.</p>
    </div>

    <div id="done" class="done">
      <svg viewBox="0 0 24 24" fill="none" stroke="#34D399" stroke-width="2.4"
           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"></circle><path d="M8 12.5l2.6 2.6L16 9.5"></path>
      </svg>
      <h2>You&rsquo;re in</h2>
      <p>See you at ${EVENT.name}. Show this screen if anyone asks.</p>
      <div class="who" id="who"></div>
    </div>
  </main>

<script type="module">
${live ? `
import { initializeApp } from 'https://www.gstatic.com/firebasejs/${SDK}/firebase-app.js';
import { getFirestore, doc, setDoc, serverTimestamp }
  from 'https://www.gstatic.com/firebasejs/${SDK}/firebase-firestore.js';

const app = initializeApp(${JSON.stringify(FIREBASE, null, 2).replace(/\n/g, '\n  ')});
const db = getFirestore(app);
` : `
// Sign-up is not wired yet: the Firebase config in build/event.js is still blank.
// The form stays visible and says so rather than pretending to save.
const db = null;
`}

const form = document.getElementById('f');
const msg  = document.getElementById('msg');
const go   = document.getElementById('go');

function fail(text) {
  msg.textContent = text;
  msg.className = 'msg bad';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  msg.className = 'msg';

  const name = document.getElementById('name').value.trim().replace(/\\s+/g, ' ');
  const code = document.getElementById('code').value.trim();

  if (name.length < 2) return fail('Please enter your name.');
  if (!/^[A-Za-z0-9-]{3,20}$/.test(code))
    return fail('That student code does not look right — digits and letters only.');
  if (!db) return fail('Sign-up is not open yet. Try again shortly.');

  go.disabled = true;
  go.textContent = 'Saving…';

  try {
    // The student code is the document id, so a second attempt with the same code is a
    // write to a document that already exists — which the rules refuse. That refusal is
    // the duplicate check; there is no read of the collection from the browser at all.
    await setDoc(doc(db, '${EVENT.collection}', code), {
      name,
      studentCode: code,
      createdAt: serverTimestamp(),
    });

    document.getElementById('who').textContent = name + ' · ' + code;
    document.getElementById('form-view').style.display = 'none';
    document.getElementById('done').classList.add('on');
  } catch (e) {
    go.disabled = false;
    go.textContent = 'Register';
    if (e && e.code === 'permission-denied') {
      fail('That student code is already registered. If this was not you, come find us.');
    } else {
      fail('Could not save that — check your connection and try again.');
    }
  }
});
</script>
</body>
</html>
`;
}

function build() {
  console.log('');
  console.log('event page (build/event.js)');

  const file = path.join(ROOT, DIR, 'index.html');
  const html = page();
  const before = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n') : null;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);

  const wired = Boolean(FIREBASE.apiKey && FIREBASE.projectId);
  console.log(`  ${DIR}/index.html`.padEnd(46) +
              `${(html.length / 1024).toFixed(1)} KB   noindex   ` +
              (wired ? `Firestore "${EVENT.collection}", SDK ${SDK}` : 'NOT WIRED — Firebase config is blank') +
              (before === null ? '   ← new' : before === html ? '' : '   ← changed'));
}

module.exports = { build, url: `${SITE}/${DIR}/` };
