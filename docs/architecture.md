# Architecture

How the portfolio is put together, end to end. Read
[`README.md`](../README.md) first — it is the canonical entry point and covers
stack, commands, static output and deployment. This page goes one level deeper
into the running application; [`static-generation.md`](static-generation.md)
covers the build step and [`content-model.md`](content-model.md) covers the data.

The project is two things that share one data module:

1. A React 19 single-page app (the SPA) that renders the portfolio and its
   dialogs in the browser.
2. A set of Node scripts that run after `vite build` and write crawlable static
   HTML. They read the same `src/data/portfolioData.ts` the SPA does.

## Boot sequence

```
index.html
  └─ <script type="module" src="/src/main.tsx">
       └─ src/main.tsx
            └─ <StrictMode>
                 └─ <MotionPrefProvider>      src/components/MotionPrefProvider.tsx
                      └─ <App />              src/App.tsx
```

`src/main.tsx` also calls `serviceWorkerRegistration.register(...)` after the
render. Registration is a no-op outside production builds and on a cross-origin
base (`import.meta.env.PROD` guard in `src/utils/serviceWorkerRegistration.ts`).

`index.html` carries the site-level `<head>`: title, description, canonical
(`https://kashcmdd.github.io/portfolio/`), Open Graph and Twitter tags, the
Person JSON-LD, font preloads, and the `index, follow` robots tag. The
`<noscript>` block points at `/journal/`, which is static HTML and readable
without JavaScript.

## `src/App.tsx`

`App` is the composition root. It does not fetch anything; every section reads
from `src/data/portfolioData.ts` directly.

### Sections

`App` renders these sections in this order (the `id` is the scroll-anchor and
nav target):

| Component | `id` | Notes |
| --- | --- | --- |
| `HeroSection` | `hero` | `CinematicVideoBackground` + HLS |
| `NowBuildingStrip` | — | The one "currently building" line |
| `AboutSection` | `about` | |
| `SkillsSection` | `skills` | Capability cards; HLS background |
| `SelectedWorksSection` | `work` | Bento grid; opens `ProjectModal` |
| `ExperienceSection` | `experience` | Timeline derived from projects |
| `TechStackSection` | `stack` | Tech grid + `SkillsRadar` |
| `JournalSection` | `journal` | Entry list + `DecisionLog` |
| `ExplorationsSection` | `explorations` | Gallery |
| `StatsSection` | — | Key metrics |
| `TestimonialsSection` | `testimonials` | Renders `null` while empty |
| `ContactFooter` | `contact` | Footer, contact, `NewsletterSignup` |

`Navbar` presents Home, About, Skills, Work, Experience, Stack and Journal.

### Dialogs

Five dialogs are `lazy()`-loaded and mounted only while they have something to
show, each wrapped in `Suspense`:

- `ProjectModal` — a project case study, opened from a card or the timeline.
- `JournalModal` — an article, opened from the list or a `#journal/<id>` hash.
- `ContactModal`
- `SearchModal`
- `ShortcutsModal`

After the loading screen clears, App warms all five chunks on idle
(`requestIdleCallback` with a 1500 ms `setTimeout` fallback) so the first open is
instant without any of that code being in first paint.

### Routing without a router

There is no `react-router`. Two mechanisms stand in:

- **Hash anchors** drive the journal deep links. `entryIdFromHash()` parses
  `#journal/<id>`, a `hashchange` listener keeps the open entry in sync with
  back/forward, and `openJournal`/`closeJournal` push and pop a history entry so
  closing returns rather than leaving a stale hash.
- **`isUnknownRoute()`** decides whether to render the app or `NotFoundView`.
  The generated route prefixes (`journal/`, `projects/`, `resume/`, `uses/`) are
  whitelisted so real static routes still resolve; only a genuinely unknown path
  shows the not-found view. This matters on hosts that fall back to
  `index.html` instead of serving `dist/404.html` — see the README's "Static
  output" section for the preview-versus-Pages difference.

This is why the generated pages exist: a crawler does not run the SPA, so a
shared `#journal/<id>` URL would only ever return the site-level metadata. The
static articles are the canonical shareable URLs.

### Effects worth knowing

- The loading screen locks `document.body` scroll while it is up; it renders
  over the page so fonts, the hero video and the first images are already in
  flight underneath.
- Active-section tracking measures section offsets once (and on resize) and
  coalesces scroll handling into one `requestAnimationFrame`.
- Keyboard shortcuts: `Cmd/Ctrl+K` and `/` open search; `?` opens the shortcuts
  modal. `/` and `?` are ignored while the visitor is typing.
- A skip-to-content link is the first tab stop.
- A service worker is registered from `main.tsx` (production only).

## Data flow

All content is imported from the single module `src/data/portfolioData.ts`;
shapes are declared in `src/types.ts`. Sections and dialogs consume it directly,
and the Node generators load the same module through Vite's SSR module runner.
There is no state store, no context for content, and no backend.

`SearchModal` is the one consumer that preprocesses: it builds a plain-text index
of every journal body once (via `entryPlainText` in `src/utils/journalText.ts`),
then scores results on each query and sorts the whole set by score, so a passing
mention in an article body cannot outrank an exact title match.

## Providers

`MotionPrefProvider` wraps the app in `main.tsx` and exposes `useMotionPref()`:

```ts
type MotionPref = 'full' | 'reduced';

interface MotionPrefValue {
  pref: MotionPref;
  reduced: boolean;               // true for the in-app toggle OR the OS setting
  setPref: (pref: MotionPref) => void;
  toggle: () => void;
}
```

- The in-app preference persists in `localStorage` under `kashh:motion`, but a
  write also dispatches a DOM event so same-tab subscribers re-read it (the
  `storage` event only fires in other tabs).
- `reduced` is true when either the toggle is `reduced` or the OS
  `prefers-reduced-motion` matches, so the GSAP timelines and autoplaying videos
  honour both routes.
- The toggle is mirrored onto `<html data-reduced-motion="true">` because CSS
  animations cannot read React state; `MotionConfig` handles the Framer Motion
  side.

## Styling and motion

- Tailwind CSS v4, CSS-first. There is no `tailwind.config`; theme tokens and
  keyframes live in `src/index.css` (`@import "tailwindcss"`), and fonts are
  declared in `src/fonts.css`.
- `.font-display` / `.font-heading` are Instrument Serif italic; `.font-body` is
  Inter.
- `.liquid-glass` and `.liquid-glass-strong` are the glass surfaces.
- Reduced motion is handled in one place in `index.css`, keyed off both the
  media query and `:root[data-reduced-motion='true']`.
- Scroll timelines use GSAP; component transitions use `motion/react`.

## Media

- `SmartImage` wraps `<img>` with intrinsic `width`/`height` (to avoid layout
  shift), lazy/eager loading, and a shimmer placeholder. It only builds a
  `srcset` for Unsplash URLs that already carry `&w=`.
- `HlsVideoBackground` uses an `IntersectionObserver` (`rootMargin: 200px`) to
  start playback only when visible, imports `hls.js` dynamically, plays HLS
  natively on Safari, and falls back to the MP4 `fallbackSource`. It never starts
  when motion is reduced.
- `CinematicVideoBackground` (used by the hero) rotates through
  `VIDEO_SOURCES`; the hero reads those sources too.

## Utilities

`src/utils/`:

| File | Export(s) | Purpose |
| --- | --- | --- |
| `useFocusTrap.ts` | `useFocusTrap<T>(active)` | Traps Tab inside a dialog and restores focus on close |
| `share.ts` | `SITE_ORIGIN`, `BASE_PATH`, `articleUrl`, `projectUrl`, `resumeUrl`, `shareTargets` | Absolute share URLs and X/LinkedIn intent links |
| `url.ts` | `safeHref` | Scheme allow-list for content-supplied links |
| `keyboard.ts` | `activateOnKey` | Enter/Space activation for click-only card elements |
| `analyticsConsent.ts` | `readAnalyticsConsent`, `writeAnalyticsConsent`, `onAnalyticsConsentChange` | Tri-state consent store + change event |
| `journalText.ts` | `blockPlainText`, `entryPlainText` | Flattens journal blocks for search indexing |
| `serviceWorkerRegistration.ts` | `register` | Production-only service worker registration |

`share.ts` hard-codes `SITE_ORIGIN = 'https://kashcmdd.github.io'` and
`BASE_PATH = '/portfolio/'`, matching the same constants in the Node
generators. See [`static-generation.md`](static-generation.md) for that contract.

## Analytics and consent

`Analytics` loads the Plausible script only in production and only once consent
is recorded. `AnalyticsConsent` shows a banner until a decision is stored. Both
read and write through `src/utils/analyticsConsent.ts`, which keeps
`localStorage` as the source of truth and dispatches an event so a mid-session
accept takes effect without a reload. The tri-state matters: `null` is "never
asked" (show the banner), distinct from a stored decline. This is the only
client persistence on the site besides the motion preference and locally stored
journal comments; there are no reaction or view counters.

## PWA

`public/sw.js` and `public/manifest.json` are copied to `dist/` by Vite's
`publicDir`; `scripts/copy-sw.mjs` then rewrites the manifest's `start_url` and
`scope` to the resolved Vite base and substitutes a build hash into the
service-worker cache names. See [`static-generation.md`](static-generation.md).

## Component inventory

All 34 files under `src/components/`, grouped by how they are reached:

- **Composed by `App` (14):** `LoadingScreen`, `Navbar`, `HeroSection`,
  `NowBuildingStrip`, `AboutSection`, `SkillsSection`, `SelectedWorksSection`,
  `ExperienceSection`, `TechStackSection`, `JournalSection`,
  `ExplorationsSection`, `StatsSection`, `TestimonialsSection`, `ContactFooter`.
- **Lazy dialogs (5):** `ProjectModal`, `JournalModal`, `ContactModal`,
  `SearchModal`, `ShortcutsModal`.
- **Supporting components (15):** `MotionPrefProvider` (root, in `main.tsx`),
  `Analytics`, `AnalyticsConsent`, `SmartImage`, `HlsVideoBackground`,
  `CinematicVideoBackground`, `ArchitectureDiagram`, `DecisionLog`,
  `SkillsRadar`, `NewsletterSignup`, `DemoPlayer`, `JournalCodeBlock`,
  `JournalComments`, `ShareBar`, `NotFoundView`.

## Dev-only behaviour that is deliberate

These are not bugs and should not be "fixed":

- `vite.config.ts` sets `base: '/portfolio/'`, so `dist/index.html` opened
  straight off disk will not find its assets — use `npm run preview`.
- The `devStaticArtifacts` Vite plugin (in `vite.config.ts`) runs
  `generate-journal-pages.mjs`, `generate-rss.mjs` and
  `generate-resume-pdf.mjs` on the first request for a generated path and serves
  the result out of `dist/`, so `/journal/` and friends behave the same in dev as
  on a static host. It deliberately omits `copy-sw.mjs`, which needs build
  output that does not exist in dev. Editing `scripts/` or `portfolioData.ts`
  invalidates the cached result.
- `sitemap.xml` is written for crawlers, and doubles as a human-readable route
  list.
- There is no test framework, no backend, no `react-router`, no light theme and
  no reaction/view counters — all by design.
