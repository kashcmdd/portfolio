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
}

export interface JournalEntry {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  content: string[];
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
