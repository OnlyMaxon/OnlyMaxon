# build

The site ships five languages as five real URLs, so each one can be crawled and ranked
on its own. **Every page on the site is generated, English included.**

| you edit | it produces |
|---|---|
| `build/src/index.html` | `/index.html` and `pl,ru,tr,es/index.html` |
| `build/src/product/index.html` | `/product/` and `<lang>/product/` |
| `build/src/<path>/index.html` | `/<path>/` and `<lang>/<path>/` |

Nothing outside `build/src/` is edited by hand. If you change `index.html` at the root it
will be silently overwritten on the next build — the file even says so on its second line.

`build/` is disallowed in `robots.txt`, so the sources are never crawled as a second copy
of the site.

## Making a change

1. Edit the page under `build/src/`, or `build/translations.js` for the wording.
2. Run:

   ```
   node build/generate.js
   ```

3. Commit `build/src/`, all five output trees, and `sitemap.xml` together.

No dependencies, no install step — plain Node.

## What the generator does

For each language, including English, it takes the source and swaps in the translations,
then fixes everything that has to differ per language:

- text via `data-i18n`, rich text via `data-i18n-html`, inputs via `data-i18n-ph`
- `<html lang>`, the language dropdown's label and active item, the language chips
- cross-page links carrying `data-page`, so a Polish reader stays in Polish
- `<title>`, meta description, Open Graph and Twitter cards — derived from the
  translated copy so they never drift out of sync
- `rel="canonical"` per language; the `hreflang` set is identical on all five pages
- the FAQ and BlogPosting structured data, translated, so rich results work everywhere
- relative `images/...` paths become `/images/...`

...and then removes what a browser has no use for:

- **comments.** The sources are commented the way they are on purpose — they are the
  documentation. None of it has to travel: on the home page it was 30% of the delivered
  file. Only unambiguous comments go; a `//` that follows code on the same line is left
  alone, because telling it apart from the `//` in an URL needs a real tokeniser. Whatever
  comes out is handed to the JS parser before it is allowed to be written.
- **`data-i18n` and `data-page` attributes**, which existed only so this script could find
  things.
- **anything between `<!-- build:root-only -->` markers**, on every page but the English
  root. The first-visit language router is the one thing only the bare domain can act on:
  it tests `location.pathname` and returns immediately anywhere else, so on the other 54
  URLs it was 1.5 KB of blocking script that parsed, ran and decided nothing.
- for `/ru/`, the preloaded Inter subset is switched from Latin to Cyrillic — otherwise
  the page would spend two high-priority requests on files it never draws a glyph from.

It refuses to write anything if a translation is missing (in any of the five languages,
English included — English is built from this table too now), if the English source and
`translations.en` have drifted apart, if English text survived a substitution, if a
relative image path slipped through, or if removing comments broke a script. If it prints
`done.`, the output is consistent.

## Adding a language

1. Add the two-letter code to `LANGS` and a label to `NAMES` in `generate.js`.
2. Add that code to every entry in `translations.js`.
3. Add a `<li>` to the dropdown and a `<link rel="alternate" hreflang="…">` in the sources.
4. Run the generator — it will tell you about any translation you missed.

## Adding a page

Add a line to `PAGES` in `generate.js` and write its English source under `build/src/`.
Canonical, hreflang, the language menus and the sitemap all follow from that.
