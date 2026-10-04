// `category` is free-form prose and is displayed verbatim on the card, so it
// cannot also be used to filter. This is the discrete bucket the work-section
// filter chips match on.
export type ProjectKind = 'Web' | 'Full-Stack' | 'Discord';

export interface Project {
  id: string;
  title: string;
  category: string;
  kind: ProjectKind;
  subtitle: string;
  description: string;
  /**
   * One honest line on what the project is worth in use, as opposed to what it
   * contains. Descriptions list features; this says why those features matter.
   * Kept qualitative on purpose — a number here would need a source, and a
   * portfolio that cites made-up metrics is worse than one that cites none.
   */
  outcome?: string;
  image: string;
  tags: string[];
  githubUrl?: string;
  repoUrl?: string; // a second repository, e.g. a related repo or cogs repo
  liveUrl?: string;
  featured: boolean;
  colSpanDesktop: number; // 5, 7 or 12 for bento grid
  aspectRatio: string;
  highlights?: string[]; // case study bullets; falls back to generic highlights
  demoFeatures?: string[]; // Interactive demo features for project preview
  demoUrl?: string; // Custom demo URL
  codePenId?: string; // CodePen embed ID
  codeSandboxId?: string; // CodeSandbox embed ID
  demoDescription?: string; // Description for the demo player
  architecture?: Architecture; // Layered system diagram, when the project has one
  inviteUrl?: string; // Bot projects: public OAuth2 invite
  supportUrl?: string; // Bot projects: support server or docs
  stats?: ProjectStat[]; // Bot projects: live, sourced numbers only
  commands?: ProjectCommand[]; // Bot projects: the command surface, grouped
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
  date: string;
  readTime: string;
  category: string;
  image: string;
  content: JournalBlock[];
  /**
   * Set on entries that are really a record of a choice rather than a tutorial.
   * These are what the decision log indexes (#15). "over" is the alternative
   * that lost, which is the part that makes the entry worth reading.
   */
  decision?: {
    chose: string;
    over: string;
  };
}

export interface TechSkill {
  name: string;
  category: 'Frontend' | 'Backend' | 'Databases' | 'DevOps' | 'Tools';
  icon: string;
  level: string;
  description: string;
}

export interface ExplorationItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
}

/**
 * Architecture diagrams (#19).
 *
 * Modelled as data rather than hand-drawn SVG so the layout maths lives in one
 * component, the static journal/page generator can render the same diagram into
 * standalone HTML, and the accessible text version is guaranteed to describe
 * the same nodes the picture does.
 *
 * Edges are expected to point from a lower `layer` index to a higher one, i.e.
 * top to bottom, which is what the curve rendering is built around.
 */
export interface ArchNode {
  id: string;
  label: string;
  /** Small second line inside the box. Keep it to a few words. */
  detail?: string;
  /** Index into `Architecture.layers`. */
  layer: number;
}

export interface ArchEdge {
  from: string;
  to: string;
  /** Short verb or protocol placed on the arrow, e.g. "typed fetch". */
  label?: string;
}

export interface ArchLayer {
  title: string;
}

export interface Architecture {
  /** One-paragraph description. Doubles as the diagram's alt text. */
  summary: string;
  layers: ArchLayer[];
  nodes: ArchNode[];
  edges: ArchEdge[];
}

/**
 * The one piece of work in progress worth naming on the page. Set it to null to
 * hide the strip entirely rather than leaving a stale line on the site.
 */
export interface CurrentlyBuilding {
  name: string;
  description: string;
  status?: string;
  url?: string;
}

/**
 * A short, hand-kept list of shipped changes shown beside the current work.
 *
 * Deliberately plain data with fixed dates rather than a live feed. The site is
 * static, so a relative timestamp ("15m ago") computed at render time would keep
 * claiming recent activity on a page nobody had touched — a lie that reads as
 * life. A dated changelog is honest about exactly how fresh it is.
 */
export interface RecentWork {
  /** Short display date, e.g. "Sep 2026". */
  date: string;
  title: string;
  kind: 'Feature' | 'Fix' | 'Refactor' | 'Content';
}

/**
 * Bot-only surface data, kept on Project instead of inferred from the prose.
 *
 * These exist because a bot case study is the one place a generic portfolio has
 * nothing to show: a screenshot proves a UI exists, not that anyone can invite
 * the bot. Every field is optional and renders only when present, so a project
 * with no public invite or no live numbers simply shows nothing rather than a
 * placeholder stat or a dead link.
 */
export interface ProjectStat {
  label: string;
  value: string;
}

/** A named group of slash commands, e.g. "Queue" -> "add, skip, move, shuffle". */
export interface ProjectCommand {
  group: string;
  detail: string;
}

/**
 * One milestone on the experience timeline (#new).
 *
 * Deliberately a flat list rather than a nested "roles with projects": this is a
 * self-directed body of work, so the meaningful unit is the thing that shipped,
 * not an employer. `period` carries a real date taken from the work itself —
 * never a placeholder year invented to fill the column.
 */
export interface ExperienceEntry {
  id: string;
  /** Short display period, e.g. "Jun 2026". */
  period: string;
  title: string;
  org: string;
  summary: string;
  stack?: string[];
  /** When set, the entry can open the matching project case study. */
  projectId?: string;
}

/**
 * A quote from a real person. The array ships empty and the section renders
 * nothing until it is filled: a portfolio that invents praise is worse than one
 * that admits it has none yet.
 */
export interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  url?: string;
}
