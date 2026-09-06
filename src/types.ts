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
  colSpanDesktop: number; // 5 or 7 for bento grid
  aspectRatio: string;
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
  category: 'Frontend' | 'Backend' | 'Databases' | 'Tools';
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
