# Content model

Every piece of content on the site lives in one file:

```
src/data/portfolioData.ts
```

Shapes are declared in `src/types.ts`. Editing that data and running
`npm run lint` and `npm run build` is the whole content workflow.

## Exports

`src/data/portfolioData.ts` exports exactly these values:

| Export | Type | Consumed by |
| --- | --- | --- |
| `warriorDetails` | inferred object | Identity, links, bio, philosophy, resume/uses generators |
| `projectsData` | `Project[]` | Work grid, timeline, project pages, resume, search |
| `experienceData` | `ExperienceEntry[]` | Experience timeline, project index periods, search |
| `testimonialsData` | `Testimonial[]` | Testimonials section (empty until quotes exist) |
| `techSkillsData` | `TechSkill[]` | Tech grid, `SkillsRadar`, resume, uses, search |
| `journalEntriesData` | `JournalEntry[]` | Journal section, modal, article pages, RSS, mirrors, search |
| `explorationItemsData` | `ExplorationItem[]` | Explorations gallery, search |
| `currentlyBuildingData` | `CurrentlyBuilding` | "Currently building" strip |
| `recentWorkData` | `RecentWork[]` | Dated changelog beside the current work |

## Types

Simplified from `src/types.ts` (field comments condensed; see the source for the
full rationale on each):

```ts
export type ProjectKind = 'Web' | 'Full-Stack' | 'Discord';

export interface Project {
  id: string;
  title: string;
  category: string;        // free-form prose, displayed verbatim
  kind: ProjectKind;       // discrete bucket the work-section filter matches
  subtitle: string;
  description: string;
  outcome?: string;        // qualitative "why it matters", never a made-up metric
  image: string;
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  colSpanDesktop: number;  // 5, 7 or 12
  aspectRatio: string;
  highlights?: string[];
  demoFeatures?: string[];
  demoUrl?: string;
  codePenId?: string;
  codeSandboxId?: string;
  demoDescription?: string;
  architecture?: Architecture;
  inviteUrl?: string;      // bot projects: public OAuth2 invite
  supportUrl?: string;     // bot projects: support server or docs
  stats?: ProjectStat[];   // bot projects: sourced numbers only
  commands?: ProjectCommand[];
}

export type JournalBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'code'; language: string; code: string; caption?: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'quote'; text: string; attribution?: string }
  | { type: 'image'; src: string; alt: string; caption?: string };

export interface JournalEntry {
  id: string;
  title: string;
  subtitle: string;
  date: string;            // short display date, e.g. "SEP 25, 2026"
  readTime: string;
  category: string;
  image: string;
  content: JournalBlock[];
  decision?: { chose: string; over: string };
}

export interface Architecture {
  summary: string;         // one paragraph; doubles as the diagram's alt text
  layers: ArchLayer[];     // { title }
  nodes: ArchNode[];       // { id, label, detail?, layer }
  edges: ArchEdge[];       // { id -> id, label? }
}
```

> The `date` field is a short uppercase string such as `"SEP 25, 2026"`, not an
> ISO date. The Node generators convert it with `toIso()` (see
> [`static-generation.md`](static-generation.md)); a value that does not match
> `MON DD, YYYY` silently yields no `datePublished` in the article JSON-LD and
> the Unix epoch as the RSS `pubDate`.

Other declared types: `TechSkill` (`name`, `category`, `icon`, `level`,
`description`), `ExplorationItem`, `CurrentlyBuilding`, `RecentWork`,
`ProjectStat`, `ProjectCommand`, `ExperienceEntry`, `Testimonial`, `ArchNode`,
`ArchEdge`, `ArchLayer`.

## Rules the data follows

These are enforced by convention and by the generators, not by a schema. Match
them when editing.

- **`experienceData` is derived, never hand-written.** It is built by mapping
  `experienceOrder` over `projectsData` and reusing each project's `outcome`
  (falling back to `subtitle`) as the summary. Periods come from
  `experiencePeriods`; an unknown id falls back to the bare year `"2026"`. To
  reorder the timeline, edit `experienceOrder`; to change a period, edit
  `experiencePeriods`.
- **Images in `public/` go through `asset()`.** `asset(file)` prepends
  `import.meta.env.BASE_URL`, because a string in this module is a runtime
  `<img src>` the bundler never rewrites. Remote URLs (Unsplash) are used
  verbatim.
- **Architecture nodes and edges are traceable.** The file's own comment is
  explicit: every node and edge must come from the project's description, tags
  or highlights. Edges point from a lower `layer` index to a higher one.
- **Bot proof fields are optional and render only when present.** `inviteUrl`,
  `supportUrl` and `stats` are deliberately unset where there is no public invite
  or sourced number, so nothing false ships.
- **`highlights` should be project-specific.** The project page and modal have a
  generic fallback trio when `highlights` is absent, but the data comment warns
  that generic filler reads as filler.
- **`testimonialsData` ships empty on purpose.** `TestimonialsSection` returns
  `null` until it is populated, so there is no invented praise to delete later.
- **`decision` is opt-in.** Only journal entries with a `decision` appear in
  `DecisionLog` and the article's decision card.

## Journal and architecture renderers that must stay in sync

`JournalBlock` is a closed sum type; because there is no Markdown parser, every
consumer is a `switch` over that union. Adding a block type (or an
`Architecture` field) means updating **all** of these in the same change:

### Over `JournalBlock`

1. **SPA** — `src/components/JournalModal.tsx` (`renderBlock`). Renders React
   elements; code goes through `src/components/JournalCodeBlock.tsx`, which
   loads Prism lazily.
2. **Static article pages** — `renderBlock` in
   `scripts/lib/journal-blocks.mjs`, called with `{ headingLevel: 2, rich: true }`
   by `scripts/generate-journal-pages.mjs`. Emits classed `<figure>` wrappers
   and pre-highlighted code.
3. **RSS feed** — the same `renderBlock`, called with
   `{ headingLevel: 3, rich: false }` by `scripts/generate-rss.mjs`. Emits bare
   tags because no stylesheet travels with the feed.
4. **Markdown mirrors** — `blocksToMarkdown` in
   `scripts/lib/journal-blocks.mjs`, used for each route's sibling `index.md`.
5. **Search index** — `blockPlainText` / `entryPlainText` in
   `src/utils/journalText.ts`. Flattens blocks to text (code included) so a
   post's body, not just its title, is searchable.

The two Node renderers share one `renderBlock`, which is why the page and the
feed cannot disagree; the SPA and the Markdown mirror are separate switches and
are the ones a change is most likely to miss.

### Over `Architecture`

1. **SPA diagram** — `src/components/ArchitectureDiagram.tsx`. Computes a
   deterministic layout from the viewBox (no measurement after paint) so it can
   also be rendered to a string, and always ships an equivalent "Read as text"
   block beneath the SVG.
2. **Static project page** — the "How It Fits Together" section in
   `projectPage()` in `scripts/generate-journal-pages.mjs`, which lists layers,
   components and connections, resolving edge ids to node labels.
3. **Project Markdown mirror** — `projectMarkdown()` in the same file, with the
   same id-to-label resolution.

## Slug and URL rules

`id` values become URL segments, href values and directory names. The Node
generators normalise them once through `slug()` (in
`scripts/lib/journal-blocks.mjs`), which strips everything outside
`[a-z0-9-]`, so a stray character cannot break an attribute or climb out of
`dist/`. Content-supplied links pass through `safeHref()`, which allows only
`http:`, `https:` and `mailto:` (relative URLs resolve into the site and are
allowed); anything else becomes an empty string and renders no link. The SPA has
the same rule in `src/utils/url.ts`.

## The self-describing entry

One journal entry, `content-model`, is itself the explanation of why the block
model is a typed union rather than Markdown. It is the place to point anyone
asking why there is no parser.

## Adding content

1. Add or edit the object in `src/data/portfolioData.ts`. Keep the shape from
   `src/types.ts`.
2. For a new journal entry, give it a unique `id` and a real `date` in
   `MON DD, YYYY` form.
3. Run `npm run lint` and `npm run build`. If you added a `JournalBlock` or
   `Architecture` consumer, update the renderers above first.
