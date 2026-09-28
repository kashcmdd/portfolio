export interface Project {
  id: string;
  title: string;
  category: string;
  subtitle: string;
  description: string;
  image: string;
  tags: string[];
  githubUrl?: string;
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
 * The one piece of work in progress worth naming on the page. Set it to null to
 * hide the strip entirely rather than leaving a stale line on the site.
 */
export interface CurrentlyBuilding {
  name: string;
  description: string;
  status?: string;
  url?: string;
}
