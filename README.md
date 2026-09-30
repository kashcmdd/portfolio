<div align="center">

# KashhCMD Portfolio (Development Version)

> **⚠️ This is the development version for testing with AI assistants.**
> **For the production site, visit [kashcmdd/portfolio](https://github.com/kashcmdd/portfolio)**

A cinematic dark portfolio: liquid glass visuals, GSAP and Motion animation, HLS video backgrounds, a typed technical journal, and project case studies that exist as real HTML as well as in-app modals.

**Not published from this repo.** The Pages workflow here is deliberately
switched off, so pushing to `main` updates nothing — see
[Deployment](#deployment) for why, and how it would be turned on. Run
`npm run preview` to look at a build locally.

<img src="public/portfolio-site.webp" alt="The portfolio landing page" width="820" />

</div>

## Stack

React 19 · TypeScript (strict) · Vite 6 · Tailwind CSS v4 · GSAP · Motion · HLS.js · Lucide React · Prism (lazy)

## Getting started

```bash
npm install
npm run dev      # dev server on http://localhost:3001
npm run lint     # tsc --noEmit — the only validation step, and what CI runs
npm run build    # vite build, then the static generators, into dist/
npm run preview  # serve dist/ at the /portfolio-dev/ base path
```

Node 20 is what the workflow pins; the build also runs on newer releases.

## Validating a change

There is no test framework here, so a change is checked three ways:

1. `npm run lint` — must pass.
2. `npm run build` — must pass. The ">500 kB chunk" warning is expected and
   non-fatal: that chunk is `hls.js`, which is fetched on demand rather than at
   first paint.
3. The build's final step asserts the generated output. `scripts/check-static-output.mjs`
   fails the build if any route, `.md` mirror, `sitemap.xml`, `llms.txt` or the
   resume PDF is missing from `dist/`, which is what catches a generator that
   half-ran while Vite still exited green. Run it alone with
   `npm run check:static`.

## Content

All content lives in one file:

```
src/data/portfolioData.ts
```

Identity and links (`warriorDetails`), projects (including their architecture
diagrams, bot command surfaces and outcome copy), the experience timeline
(`experienceData`, derived from the projects so it cannot drift), journal entries
(including their decision logs), the tech grid, explorations, testimonials
(`testimonialsData`, empty until real quotes exist — the section hides itself),
the "currently building" line and the dated changelog beneath it.
The shape of each of those is declared in `src/types.ts`.

Journal prose is a typed block list rather than markdown — a block is a paragraph,
heading, list, quote or code sample. That is deliberate: with no parser to keep in
sync, an entry cannot render one way on the site and another way in its generated
page.

Edit it, then run `npm run lint` and `npm run build`.

## Static output

`npm run build` is more than a bundle. Once Vite finishes, four generator scripts
run, followed by the assertion that they produced what they should:

- `scripts/generate-journal-pages.mjs` — `/journal/` (index plus one page per
  article), `/projects/` (index plus one page per project), `/resume/`, `/uses/`,
  `404.html`, `sitemap.xml` and `robots.txt`. Each generated page carries its own
  title, description, canonical, Open Graph and Twitter tags and JSON-LD, and code
  samples are highlighted with Prism during the same pass. Every route also gets a
  sibling `index.md`, and a root `llms.txt` indexes the whole site for tools and
  assistants that read text rather than HTML.
- `scripts/generate-rss.mjs` — `rss.xml`.
- `scripts/copy-sw.mjs` — the service worker.
- `scripts/generate-resume-pdf.mjs` — `KashhCMD-Resume.pdf`. It prints the
  generated `/resume/` page with headless Chrome or Edge, so the PDF carries the
  real Inter and Instrument Serif faces, and falls back to a small hand-written
  PDF when no browser is installed. `RESUME_PDF_BROWSER` overrides the browser
  path.
- `scripts/check-static-output.mjs` — writes nothing. It reads `dist/` and fails
  the build when a page the four above should have produced is missing.

Those pages are plain HTML, so they read with JavaScript disabled; the
`<noscript>` block in `index.html` points at the journal for exactly that reason.

One difference to expect while testing locally: `npm run preview` answers an
unknown path with the SPA shell and a `200`, while GitHub Pages answers it with
`dist/404.html` and a `404`. The not-found page therefore only appears on a real
static host, not in preview.

## Deployment

`.github/workflows/deploy.yml` is present and correct in shape — Node 20,
`npm run lint`, `npm run build`, upload `dist/`, deploy with `actions/deploy-pages`
— but it is **intentionally not enabled**. The repository's Pages source is
switched off, so the run stops at `actions/configure-pages@v5`. This is the dev
build; the production site is
[kashcmdd/portfolio](https://github.com/kashcmdd/portfolio). Please do not turn the
workflow on as a "fix" — the dev URL is
`https://kashcmdd.github.io/portfolio-dev/` and it is populated only when someone
publishes there on purpose.

`vite.config.ts` sets `base: '/portfolio-dev/'` to match the Pages subpath, which
is also why `dist/index.html` opened straight off disk will not find its assets —
use `npm run preview`.

## Indexing

This build is deliberately invisible to search engines: `index.html` carries
`<meta name="robots" content="noindex, nofollow">`, every generated page does the
same, and `robots.txt` is `Disallow: /`. All three are on purpose in this
repository. `sitemap.xml` is still written, but with crawling disallowed it is a
route list for humans and tooling rather than something a crawler will fetch.

## Notes

- `npm run clean` is `rm -rf dist`: fine on Linux, macOS and CI, but it fails on
  Windows, where npm runs scripts through `cmd.exe`, which has no `rm`.
- Comments in this codebase are long on purpose and explain *why* something is the
  way it is, so that the next reader does not undo it. Match that style.

## License

Apache-2.0 — see [LICENSE](LICENSE).