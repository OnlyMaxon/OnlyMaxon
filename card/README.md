# card

The NFC card product: a page the chip opens, and an editor its owner signs into.

```
onlymaxon.com/u/<slug>        what a stranger sees when they tap          (this Worker)
onlymaxon.com/u/<slug>/photo  the avatar, streamed from a private bucket  (this Worker)
onlymaxon.com/u/<slug>/contact.vcf                                        (this Worker)
onlymaxon.com/card/           sign in, your cards, the editor             (this Worker)
everything else               the static site                             (GitHub Pages)
```

The chip holds a URL and nothing else. **Everything a visitor sees comes out of the
database**, which is the whole product: the owner edits the page, the card in their pocket
does not change, and the next tap shows the new version. No build step sits between the
two — the page is rendered on request at the Cloudflare edge nearest whoever is holding
the phone.

## Why a Worker and not a page that fetches its data

The product is the second and a half after somebody touches a card to a phone, usually
outdoors, on mobile data, holding a stranger's handset. A page that loads and *then* asks
a database what to draw spends that second and a half showing nothing. Here the HTML
arrives finished.

## Set-up, in order

The order matters: step 5 is the moment the static `/u/max/` stops being served.

```bash
# 1. the database
npx wrangler d1 create onlymaxon-cards          # paste the id into wrangler.toml
npx wrangler d1 execute onlymaxon-cards --file card/schema.sql --remote

# 2. the bucket for photos (private — no public access, ever)
npx wrangler r2 bucket create onlymaxon-card-photos

# 3. the existing card, before anything points at the Worker
npx wrangler d1 execute onlymaxon-cards --file card/seed.sql --remote

# 4. email for the sign-in links
#    Verify onlymaxon.com in Resend first, or every message is rejected.
npx wrangler secret put RESEND_KEY

# 5. deploy — this is when /u/* becomes the Worker's
npx wrangler deploy --config card/wrangler.toml
```

Local development, against a local copy of the database:

```bash
npx wrangler dev --config card/wrangler.toml
npx wrangler d1 execute onlymaxon-cards --file card/schema.sql --local
npx wrangler d1 execute onlymaxon-cards --file card/seed.sql   --local
```

Without `RESEND_KEY` the sign-in link is printed to the Worker's log instead of being
emailed, and the form says plainly that it could not send — so you can develop without a
mail provider, and a missing key in production is loud rather than a form that appears to
work and quietly sends nothing.

## What happens to the old static pages

`build/profiles.js` still writes `u/<slug>/index.html` and `contact.vcf` from
`build/profiles.json`. Once step 5 is done those files are no longer served — the route
wins — but they stay in the repository on purpose until the first week is behind us:
remove the route and the static copy is live again, which is the only rollback worth
having for a URL printed on plastic.

When that week is over: delete `build/profiles.json`, the `require('./profiles.js')` call
at the bottom of `build/generate.js`, and the `u/` tree.

## Writing a card — NTAG 215

**A chip that is not protected is not a product.** Out of the factory NTAG 215 is writable
by anyone: a stranger with a phone and any NFC app rewrites a card to their own URL in
about ten seconds, and its owner has no way to know it happened. Two writes stop that, and
both happen at the bench before the card is given away:

| step | what | why |
|---|---|---|
| 1 | Write the NDEF URL record `https://onlymaxon.com/u/<slug>` | ~40 of the chip's 504 usable bytes |
| 2 | Write `PWD` + `PACK`, then `AUTH0 = 0x04` and **`PROT = 0`** | every write from page 4 up now needs the password; reads stay open |

`PROT` **must be 0.** `PROT = 1` protects reads as well, and a card whose NDEF cannot be
read without a password is a card that no phone will ever open — which is the entire
product. 0 means "writes need the password, anyone may read", which is exactly right for
a tag whose whole job is to be read by strangers.

`AUTH0 = 0x04` is doing more work than it looks. Protection applies from that page
*upwards*, and the config pages (131–134 on NTAG 215) sit above it — so the password also
protects `PWD`, `PACK`, `AUTH0` and `PROT` themselves. Without the password nobody can
rewrite the URL *or* take the protection off.

**Which is why `CFGLCK` is not in this table.** It exists to stop the configuration being
changed, and `AUTH0` already does that. Setting it buys nothing and is **irreversible**:
the card can never be reconfigured again, not even by us, not even with the password. An
irreversible step that adds no protection is a way to destroy stock, so it stays off.

Same reasoning, stronger, for the **static lock bits** on the data pages: irreversible, and
a card you can no longer rewrite is a card you cannot re-point if a slug ever has to move.

Keep the password **per batch, not per card**, and keep it somewhere that is not this
repository. One password for every card ever made is one leak away from all of them; a
password per card is a spreadsheet nobody will maintain.

### The counter, which is worth more than it looks

NTAG 215 has a 24-bit one-way read counter and an ASCII mirror: the chip can write its own
UID and tap count *into the URL it serves*, so the tag opens
`/u/max?c=0001F4&u=04A2…` without an app, a script or a battery. That gives two things
this Worker does not have yet:

- **a tap count the chip itself vouches for**, next to the one `card_taps` counts here —
  which is the difference between "47 opens" and "47 taps", since a link someone forwarded
  is an open and not a tap;
- **a weak but real clone check**: the UID is factory-programmed and not writable, so a
  copied card can be spotted by a UID that does not match the slug.

Enabling the mirror is a config-page write, so it has to happen in step 2 above, *before*
the config is locked. If you think you will ever want it, turn it on for the first batch —
retrofitting it means re-encoding every card that has already been posted.

## The shape of the data

```
accounts ──< cards ──< card_services
                   ├─< card_links
                   └─< card_taps        (one row per card per day, not per tap)
```

An account is an email address. There is no password column and there should never be one
— sign-in is a one-time link, so nothing of the user's is stored here that could leak.
See the header of `src/auth.js` for the reasoning in full.

There is no billing and no plan column. The cards are given away, so there is no tier to
be on — and a column that exists "for later" tells the next reader to go looking for
billing code that does not exist.

## Files

| file | what |
|---|---|
| `src/index.js` | routing, validation, photo upload |
| `src/render.js` | the public card page and the vCard — a port of `build/profiles.js` |
| `src/editor.js` | sign-in, the card list, the edit form |
| `src/auth.js` | one-time links, sessions, the mail call |
| `src/db.js` | every SQL statement in the product |
| `src/html.js` | escaping, the palettes, the editor's chrome |
| `schema.sql` | the tables, re-runnable |
| `seed.sql` | the one card that already existed |

`src/render.js` is deliberately a copy of the static renderer rather than an import of it:
a Worker cannot require a CommonJS file from `build/`, and the two will diverge the day the
static one is deleted. Until then, a change to the card's look has to be made twice — which
is the price of being able to roll back to Pages by deleting one route.
