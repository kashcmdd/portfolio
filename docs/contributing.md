# Contributing and validation

Read [`README.md`](../README.md) first for stack, commands and deployment; this
page covers how to check a change and the conventions a change is expected to
follow. The other docs in this directory:

- [`architecture.md`](architecture.md) — how the app is put together.
- [`content-model.md`](content-model.md) — `portfolioData.ts`, `types.ts`, and the
  renderers that must stay in sync.
- [`static-generation.md`](static-generation.md) — the build pipeline and its output.

## Commands

```bash
npm install
npm run dev      # dev server on http://localhost:3001
npm run lint     # tsc --noEmit — the only type check, and what CI runs
npm run build    # vite build, then the static generators, into dist/
npm run preview  # serve dist/ at the /portfolio-dev/ base path
npm run check:static   # the build's final assertion, on its own
npm run clean    # rm -rf dist (fails on Windows cmd.exe — see README Notes)
```

Node 20 is what the workflow pins; newer releases also build.

## The validation loop

There is no test framework here, by design. A change is checked three ways:

1. **`npm run lint`** must pass. The project is TypeScript `strict` with
   `noUnusedLocals` and `noUnusedParameters`, so an unused import or variable
   fails the check.
2. **`npm run build`** must pass. The ">500 kB chunk" warning is expected and
   non-fatal: that chunk is `hls.js`, fetched on demand rather than at first
   paint.
3. **The build's final step** (`scripts/check-static-output.mjs`) asserts the
   generated output. It fails the build when a route, `.md` mirror,
   `sitemap.xml`, `llms.txt` or the resume PDF is missing from `dist/`, which is
   what catches a generator that half-ran while Vite still exited green. Run it
   alone with `npm run check:static` after a build.

CI (`.github/workflows/deploy.yml`) runs `npm ci`, `npm run lint` and
`npm run build`. In this repository the Pages deploy is deliberately switched
off — see the README's "Deployment" section. Do not enable it as a "fix".

## House style

- **Comments are long and explain *why*.** This is deliberate: the next reader
  should not undo a decision they cannot see the reason for. Match that style,
  and never strip or shorten existing comments to tidy code.
- **Content is data, not prose in components.** Edit
  `src/data/portfolioData.ts`, not the section that renders it.
- **Stay honest about what is known.** The data model deliberately leaves
  optional fields unset (no invite URL, no sourced stat, empty testimonials)
  rather than shipping a placeholder. `outcome` copy is qualitative on purpose;
  a metric would need a source.
- **Keep the renderers in sync.** If you change `JournalBlock` or
  `Architecture`, update every consumer listed in
  [`content-model.md`](content-model.md) in the same change. A missing renderer
  silently drops a section from one output.
- **Keep the base and origin in sync.** `vite.config.ts` (`base`),
  `src/utils/share.ts` and the three Node generators each carry the site origin
  or base path; they must move together. See
  [`static-generation.md`](static-generation.md).
- Do not introduce secrets, and keep source files UTF-8 without a BOM.

## Intentional constraints

These look like gaps but are on purpose. Do not "fix" them:

- **No test framework.** The generators plus `check-static-output` are the
  safety net; see the validation loop above.
- **No `react-router`.** Navigation is hash anchors plus real generated static
  pages.
- **No backend.** Comments are stored in `localStorage` in the visitor's own
  browser and are never sent anywhere; analytics only loads after consent.
- **No reaction or view counters.** There is no client persistence for social
  engagement.
- **No light theme.** The design is dark-only; `<meta name="color-scheme" content="dark">`.
- **This repo is `noindex, nofollow` with `robots.txt: Disallow: /`**, and sets
  `base: '/portfolio-dev/'`. Both are intentional for the development repo;
  production is a separate repository and publishes the same code with different
  settings.
- **GitHub Pages is disabled here.** The deploy workflow is present and correct
  in shape but intentionally not enabled.

## Common changes

### Editing content

Edit `src/data/portfolioData.ts`, then run `npm run lint` and `npm run build`.
Structures are declared in `src/types.ts`. Details and per-type rules are in
[`content-model.md`](content-model.md).

### Adding a project or journal entry

Add the object with a unique `id` (and a real `date` in `MON DD, YYYY` form for
a journal entry). The generators walk the data, so no list of projects or
entries is maintained anywhere else — `check-static-output` discovers the new
subdirectory from disk.

### Adding a section or dialog

Add the component under `src/components/` and compose it in `src/App.tsx`. A
dialog should be `lazy()`-loaded and, if it opens on interaction, warm it in the
idle-prefetch effect alongside the existing five.

### Changing the build pipeline

Build steps live in the `build` script in `package.json` and in `scripts/`.
After adding a generator, extend `scripts/check-static-output.mjs` so a half-run
fails the build, and consider whether the dev middleware in `vite.config.ts`
should run it. Update [`static-generation.md`](static-generation.md).
