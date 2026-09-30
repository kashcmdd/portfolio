# Static generation

`npm run build` is more than a bundle. The full script is:

```
vite build
  && node scripts/generate-journal-pages.mjs
  && node scripts/copy-sw.mjs
  && node scripts/generate-rss.mjs
  && node scripts/generate-resume-pdf.mjs
  && node scripts/check-static-output.mjs
```

The README describes the same pipeline — the four generators
(`generate-journal-pages`, `copy-sw`, `generate-rss`, `generate-resume-pdf`)
followed by the `check-static-output` assertion. The generators load
`src/data/portfolioData.ts` directly through Vite's SSR module runner, so the
static output is built from the same data the SPA renders.

All three generator scripts that emit URLs call `requireBase()` first, which
throws if Vite resolved `base` to an empty string or `/`. The base is
`/portfolio-dev/` in this repository; a build with no base fails loudly rather
than shipping absolute links to the wrong project.

## `scripts/generate-journal-pages.mjs`

The largest script. It writes a real HTML page for every journal entry, every
project, and the index / resume / uses / 404 / sitemap / robots routes.

What it writes under `dist/`:

| Path | Contents |
| --- | --- |
| `journal/index.html`, `journal/index.md` | Journal index |
| `journal/<id>/index.html`, `journal/<id>/index.md` | One per journal entry |
| `projects/index.html`, `projects/index.md` | Project index |
| `projects/<id>/index.html`, `projects/<id>/index.md` | One per project |
| `resume/index.html`, `resume/index.md` | Skills-based resume |
| `uses/index.html`, `uses/index.md` | Colophon |
| `404.html` | Static-host not-found page |
| `sitemap.xml` | Route list (still written although crawling is disallowed) |
| `robots.txt` | `User-agent: *` / `Disallow: /`, mirroring the noindex meta |
| `llms.txt` | Text index of the whole site |

Every generated page carries its own title, description, canonical, Open Graph
and Twitter tags and JSON-LD, plus the `noindex, nofollow` robots meta. Article
pages additionally get a share bar (with a delegated clipboard handler and a
`document.execCommand` fallback), a decision card when `entry.decision` is set,
a table of contents when there are three or more headings, and Prism-highlighted
code with a copy button. The table of contents and the heading ids both come
from `outlineSlugs`/`articleOutline`, so the links cannot point at headings that
do not exist.

It exits with `no journal entries loaded` if `journalEntriesData` is empty.
Projects, resume and uses are written only when the corresponding data exists
(`projectsData.length`, and `techSkillsData.length && warriorDetails`).
Journal and project ids are normalised with `slug()` before use, so they are
safe as URL segments and directory names.

## `scripts/generate-rss.mjs`

Writes `dist/rss.xml` from `journalEntriesData`. It uses the shared
`renderBlock` with `headingLevel: 3` and `rich: false` (a feed item has no
document outline and no stylesheet), escapes text with `esc`, and wraps the
rendered body in CDATA, escaping only the `]]>` sequence. Dates go through
`toPubDate`.

The author email is GitHub's no-reply address
(`kashcmdd@users.noreply.github.com`) so the feed declares a contact that cannot
bounce. It also throws `no journal entries loaded` when the array is empty.

## `scripts/copy-sw.mjs`

Runs after Vite has copied `public/` into `dist/`. It does two things:

1. Rewrites `dist/manifest.json` — `start_url`, `scope`, every icon `src` and
   every shortcut `url`/icon — replacing the checked-in source prefix
   `/portfolio-dev/` with the resolved Vite base. It then asserts that
   `start_url` and `scope` equal the base and throws if they do not, which
   catches a `public/manifest.json` that no longer starts those with
   `/portfolio-dev/`.
2. Substitutes `__BUILD_VERSION__` in `public/sw.js` (written to `dist/sw.js`)
   with a 10-character SHA-256 digest taken over the sorted `dist/assets/`
   filenames and `dist/index.html`. The service worker's cache names include
   this hash, so a new build installs new caches and the activate step clears
   the old ones.

It throws `dist/ not found — run this after \`vite build\`` if run standalone
before a build, and warns (does not fail) if `public/sw.js` is missing.

## `scripts/generate-resume-pdf.mjs`

Writes `dist/KashhCMD-Resume.pdf`. It prefers to print the generated
`dist/resume/index.html` with headless Chrome or Edge, so the PDF carries the
real Inter and Instrument Serif faces and the resume's print stylesheet. It
searches a fixed candidate list (Windows Chrome/Edge paths, Linux
chrome/chromium/edge paths) and accepts an override via the environment
variable `RESUME_PDF_BROWSER`. If `dist/fonts` is absent it copies `public/fonts`
next to the page first; the browser is then driven with `--headless=new`,
`--no-pdf-header-footer` and `--virtual-time-budget=6000` (to let webfonts
finish loading).

When no browser is found or the print fails, it falls back to a small
hand-written PDF: Helvetica (one of the fourteen base fonts, so nothing is
embedded), WinAnsi-safe text transliterated to ASCII, an exact-width greedy
wrapper, and the same data read from `portfolioData.ts`. The fallback is plainer
but always builds on a machine with no browser. The logged line states which
path was taken.

## `scripts/check-static-output.mjs`

Writes nothing. It reads `dist/` and fails the build when the output is
incomplete — the cheap failure it exists to catch is a generator that half-ran
while Vite still exited green. The generators are effectively the test suite
here.

It asserts:

- Root files exist: `index.html`, `404.html`, `sitemap.xml`, `robots.txt`,
  `rss.xml`, `llms.txt`, `manifest.json`, `sw.js`, `KashhCMD-Resume.pdf`.
- Each of `journal/`, `projects/`, `resume/`, `uses/` has a non-empty
  `index.html` and `index.md`.
- Every subdirectory of `journal/` and `projects/` has a non-empty `index.html`
  and `index.md`, and each group has at least one page. The set is walked from
  disk, not from a hard-coded list, so adding a project needs no edit here.
- `llms.txt` is non-empty and references `/journal/`, `/projects/`, `/resume/`
  and `/uses/`.

On failure it prints one line per problem and exits `1`. It runs automatically
at the end of `npm run build`, and alone as `npm run check:static` after a build.

## Shared helpers

`scripts/lib/journal-blocks.mjs` — the escaping and block-rendering primitives
shared by the two build scripts. It imports `scripts/lib/prism.mjs` and
re-exports from `scripts/lib/journal-outline.mjs`. Exports:

| Export | Purpose |
| --- | --- |
| `MONTHS` | Three-letter month to number map |
| `esc(value)` | HTML-attribute-safe escaping (`& < > " '`) |
| `slug(value)` | Restricts an id to `[a-z0-9-]` |
| `safeHref(value)` | Scheme allow-list (`http`, `https`, `mailto`); else `''` |
| `toIso(date)` | `"MON DD, YYYY"` → `YYYY-MM-DD`, or `null` if unparseable |
| `toPubDate(date)` | RFC 822 date for RSS, epoch if unparseable |
| `articleOutline(blocks)` | Re-export of the outline helper |
| `renderBlocks(blocks, opts)` | Renders a whole article, threading heading ids |
| `renderBlock(block, opts)` | One block; `opts` is `{ headingLevel, rich, slug }` |
| `requireBase(config, label)` | Returns Vite `base`, or throws if empty/`/` |
| `blocksToMarkdown(blocks)` | Renders the block union as Markdown |

`scripts/lib/journal-outline.mjs` — `slugifyHeading`, `outlineSlugs` and
`articleOutline`. It is split out from `journal-blocks.mjs` on purpose: the SPA
imports these helpers eagerly to build a table of contents, and if they shared a
module with `journal-blocks.mjs` that import would drag Prism into the initial
bundle.

`scripts/lib/prism.mjs` — `grammarFor`, `highlightCode`, `PRISM_TOKEN_CSS`.
Only the languages the journal uses are registered (Markup, CSS, JavaScript,
TypeScript, JSX, Python, Bash; TSX is TypeScript extended with JSX). Unknown
languages fall back to escaped plain text. The one theme is a plain CSS string
so both the static pages and the SPA can inject the same colours.

The `.d.mts` files beside `prism.mjs` and `journal-outline.mjs` give the SPA
type declarations for those `.mjs` modules, which it imports directly.

## The URL / base contract

- `vite.config.ts` sets `base: '/portfolio-dev/'`.
- `src/utils/share.ts` hard-codes `SITE_ORIGIN = 'https://kashcmdd.github.io'`
  and `BASE_PATH = '/portfolio-dev/'`.
- The Node generators hard-code `SITE_ORIGIN = 'https://kashcmdd.github.io'`
  (in `generate-journal-pages.mjs`, `generate-rss.mjs` and
  `generate-resume-pdf.mjs`).

These are deliberately duplicated but must stay in sync: absolute share URLs and
canonical/JSON-LD URLs cannot be derived from `window.location` (a link shared
from a dev server or preview would carry that origin), so the origin is a
constant. If the base or origin changes, all of these move together.

## The dev middleware

The generator scripts normally run only as part of `vite build`, so while the
dev server is up the generated pages do not exist and Vite would answer every
unknown path with the SPA shell. The `devStaticArtifacts` plugin in
`vite.config.ts` fixes that: on the first request for a generated path it runs
`generate-journal-pages.mjs`, `generate-rss.mjs` and
`generate-resume-pdf.mjs`, then serves the file out of `dist/`.

- It omits `copy-sw.mjs`, which rewrites `dist/manifest.json` and hashes
  `dist/assets` — neither exists until `vite build` has run. In dev, Vite serves
  `manifest.json` and `sw.js` from `public/`, and the build-hash rewrite only
  matters for a real deploy.
- Paths are resolved and confined to `dist/` (a resolved-prefix check), and the
  served files are limited to a known set (`rss.xml`, `sitemap.xml`,
  `robots.txt`, `404.html`, `KashhCMD-Resume.pdf`, `llms.txt`) plus the
  `journal/`, `projects/`, `resume/` and `uses/` directories.
- Generation is deferred until the first matching request and remembered, so
  starting the dev server stays fast. Editing anything under `scripts/` or
  `portfolioData.ts` invalidates the cached result; the next request regenerates
  it without a restart.

`check-static-output.mjs` is not run by the dev middleware.

## Output tree

```
dist/
  index.html                     # Vite (SPA shell)
  404.html  sitemap.xml  robots.txt  rss.xml  llms.txt
  manifest.json  sw.js  KashhCMD-Resume.pdf
  og-image.jpg  favicon.svg  apple-touch-icon.png
  fonts/  assets/                # assets/ is Vite's hashed bundle
  journal/index.html  journal/index.md
  journal/<id>/index.html  journal/<id>/index.md
  projects/index.html  projects/index.md
  projects/<id>/index.html  projects/<id>/index.md
  resume/index.html  resume/index.md
  uses/index.html  uses/index.md
  <public/ images>
```

Vite copies `public/` into `dist/` via `publicDir`; the generators add the rest.
Every page is plain HTML that reads with JavaScript disabled, which is the
reason the static routes exist at all.
