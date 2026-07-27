# build

The site ships five languages as five real URLs, so each one can be crawled and ranked
on its own:

| URL | file | edited by |
|---|---|---|
| `/` | `index.html` | you, by hand — this is the source of truth |
| `/pl/` `/ru/` `/tr/` `/es/` | `<lang>/index.html` | **generated — do not edit** |

## Making a change

1. Edit `index.html` (English), or `build/translations.js` (everything else).
2. Run:

   ```
   node build/generate.js
   ```

3. Commit `index.html`, the four generated folders, and `sitemap.xml` together.

No dependencies, no install step — plain Node.

## What the generator does

For each language it takes `index.html` and swaps in the translations, then fixes
everything that has to differ per language:

- text via `data-i18n`, rich text via `data-i18n-html`, inputs via `data-i18n-ph`
- `<html lang>`, the language dropdown's label and active item
- `<title>`, meta description, Open Graph and Twitter cards — derived from the
  translated hero copy so they never drift out of sync
- `rel="canonical"` per language; the `hreflang` set is identical on all five pages
- the FAQ structured data, translated, so rich results work in every language
- relative `images/...` paths become `/images/...`, since the page moves one level deep

It then refuses to write anything if a translation is missing, if English text survived
a substitution, or if a relative image path slipped through. If it prints `done.`, the
output is consistent.

## Adding a language

1. Add the two-letter code to `LANGS` and a label to `NAMES` in `generate.js`.
2. Add that code to every entry in `translations.js`.
3. Add a `<li>` to the dropdown and a `<link rel="alternate" hreflang="…">` in `index.html`.
4. Run the generator — it will tell you about any translation you missed.
