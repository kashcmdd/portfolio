import { Project, JournalEntry, TechSkill, ExplorationItem } from '../types';

export const warriorDetails = {
  name: "KashhCMD",
  title: "Started Web Designer",
  location: "",
  avatarUrl: "https://github.com/WarriorOGZz.png",
  bio: "I'm KashhCMD, a web designer and Discord bot developer who enjoys building modern digital experiences. My journey into programming started with curiosity and has grown into a passion for creating websites, applications, and tools that are both visually appealing and highly functional.",
  philosophy: "I believe that every line of code should have a purpose. I aim to write clean, maintainable, and scalable code while focusing on performance, accessibility, and user experience. Rather than simply making something work, I strive to create products that feel polished, intuitive, and enjoyable to use.",
  roles: ["Web Dev", "Discord Bot Dev"],
  email: "",
  github: "",
  discord: "",
  twitter: "",
};

export const projectsData: Project[] = [
  {
    id: "scriptforge",
    title: "ScriptForge",
    category: "Full-Stack Web App",
    subtitle: "Controller-Script Hub for Streaming Devices",
    description: "A Next.js controller-script hub: device & script management, transactional script editing with conflict-safe versions, self-serve accounts with session invalidation and account deletion, CSRF-protected APIs, a GPC script parser, and 75 unit + end-to-end tests.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    tags: ["Next.js", "React", "TypeScript", "Tailwind CSS", "SQLite", "Vitest"],
    githubUrl: "https://github.com/kashcmdd/scriptforge",
    featured: true,
    colSpanDesktop: 7,
    aspectRatio: "aspect-[16/10]",
  },
  {
    id: "eleven-stack",
    title: "Eleven Music Stack",
    category: "Discord Infrastructure",
    subtitle: "Self-Hosted Music Bot: Lavalink v4, PostgreSQL, Redis",
    description: "End-to-end deployment of the eleven music bot: Lavalink v4 audio nodes, Postgres-persisted state, Redis caching, and hybrid sharding — built on the OpenUwU eleven project and tuned to run as a production stack on Windows.",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
    tags: ["TypeScript", "Discord.js", "Lavalink", "PostgreSQL", "Redis"],
    githubUrl: "https://github.com/OpenUwU/eleven",
    featured: true,
    colSpanDesktop: 5,
    aspectRatio: "aspect-[4/3]",
  },
  {
    id: "melon",
    title: "Melon",
    category: "Discord Moderation",
    subtitle: "Maintained Fork of an All-in-One Multipurpose Bot",
    description: "A maintained fork of the Melon multipurpose bot — antinuke protection, automod, AI chat, tickets, giveaways, join-to-create voice, autopost and more, on hybrid prefix + slash commands with Sequelize-backed Postgres state.",
    image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80",
    tags: ["Discord.js", "Node.js", "PostgreSQL", "Sequelize"],
    githubUrl: "https://github.com/kashcmdd/Melon-All-In-One-Discord-Bot",
    featured: true,
    colSpanDesktop: 5,
    aspectRatio: "aspect-[4/3]",
  },
  {
    id: "kashhcmd-portfolio",
    title: "KashhCMD Portfolio",
    category: "Web Design & Frontend",
    subtitle: "Liquid Glass Landing Page, Deployed on GitHub Pages",
    description: "This site — a cinematic dark portfolio with liquid glass visuals, GSAP animations and HLS video backgrounds, personalized and continuously deployed to GitHub Pages through a push-triggered Actions workflow.",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    tags: ["React", "Vite", "TypeScript", "Tailwind CSS", "GSAP", "GitHub Pages"],
    githubUrl: "https://github.com/kashcmdd/portfolio",
    liveUrl: "https://kashcmdd.github.io/portfolio/",
    featured: true,
    colSpanDesktop: 7,
    aspectRatio: "aspect-[16/10]",
  },
];

export const techSkillsData: TechSkill[] = [
  // Frontend
  { name: "React & React 19", category: "Frontend", icon: "Code2", level: "Advanced", description: "Hooks, Context, State Management, Custom Reusable UI Architectures" },
  { name: "Next.js", category: "Frontend", icon: "Globe", level: "Proficient", description: "Server Side Rendering, App Router, Dynamic API Proxy Routes" },
  { name: "TypeScript", category: "Frontend", icon: "FileCode", level: "Advanced", description: "Strict Typing, Generic Interfaces, Modular Codebases" },
  { name: "Tailwind CSS v4", category: "Frontend", icon: "Palette", level: "Expert", description: "Custom Theme Tokens, Responsive Liquid Layouts, Utility Design" },
  { name: "HTML5 & CSS3", category: "Frontend", icon: "Layout", level: "Expert", description: "Semantic Markup, Modern Flexbox/Grid, Glassmorphism FX" },

  // Backend
  { name: "Node.js", category: "Backend", icon: "Server", level: "Advanced", description: "Asynchronous I/O, Event Loop Optimization, Middleware Design" },
  { name: "Express.js", category: "Backend", icon: "Cpu", level: "Advanced", description: "RESTful Endpoint Architecture, Authentication, Middleware Pipeline" },
  { name: "Discord.js", category: "Backend", icon: "Bot", level: "Expert", description: "Custom Bot Bots, Slash Commands, Sharding & WebSocket Events" },
  { name: "REST APIs", category: "Backend", icon: "Network", level: "Expert", description: "API Gateways, Rate Limiting, JSON Payload Serialization" },

  // Databases
  { name: "MongoDB", category: "Databases", icon: "Database", level: "Proficient", description: "NoSQL Document Modeling, Mongoose Schemas, Aggregations" },
  { name: "MySQL", category: "Databases", icon: "Table", level: "Proficient", description: "Relational Queries, Foreign Keys, Indexing & Performance" },
  { name: "SQLite", category: "Databases", icon: "HardDrive", level: "Advanced", description: "Lightweight Embedded Storage, Fast Local Query Execution" },

  // Tools
  { name: "Git & GitHub", category: "Tools", icon: "GitBranch", level: "Expert", description: "Version Control, Pull Requests, Automated Workflows" },
  { name: "VS Code & Postman", category: "Tools", icon: "Terminal", level: "Expert", description: "Environment Workflows, API Inspection & Debugging" },
  { name: "Vercel & Pterodactyl", category: "Tools", icon: "Cloud", level: "Advanced", description: "Serverless Deployments, Container Management, Process Monitoring" },
];

export const journalEntriesData: JournalEntry[] = [
  {
    id: "journal-placeholder-1",
    title: "Journal Entry — Coming Soon",
    subtitle: "A future post about building, learning, and shipping.",
    date: "COMING SOON",
    readTime: "—",
    category: "DRAFT",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    content: [
      "This space is reserved for a future journal entry. It will cover lessons learned, projects in progress, and notes from the journey so far.",
      "Check back soon."
    ]
  },
  {
    id: "journal-placeholder-2",
    title: "Notes From the Journey — Coming Soon",
    subtitle: "Thoughts on design, Discord bots, and web development.",
    date: "COMING SOON",
    readTime: "—",
    category: "DRAFT",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    content: [
      "This space is reserved for a future journal entry. It will cover lessons learned, projects in progress, and notes from the journey so far.",
      "Check back soon."
    ]
  },
  {
    id: "journal-placeholder-3",
    title: "Placeholder Entry",
    subtitle: "Room to grow.",
    date: "COMING SOON",
    readTime: "—",
    category: "DRAFT",
    image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80",
    content: [
      "This space is reserved for a future journal entry. It will cover lessons learned, projects in progress, and notes from the journey so far.",
      "Check back soon."
    ]
  }
];

export const explorationItemsData: ExplorationItem[] = [
  {
    id: "exp-1",
    title: "Cybernetic HUD UI",
    category: "Experimental Interface",
    image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80",
    description: "Futuristic telemetry HUD with animated data streams and reactive ambient lighting."
  },
  {
    id: "exp-2",
    title: "Bot Orchestration Nodes",
    category: "Infrastructure Visualizer",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    description: "Interactive node graph visualizing WebSocket payload distribution across distributed clusters."
  },
  {
    id: "exp-3",
    title: "Liquid Glass Dashboard",
    category: "UI System",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    description: "Deep dark theme dashboard featuring frosted acrylic panels and gradient glow highlights."
  },
  {
    id: "exp-4",
    title: "REST Endpoint Inspector",
    category: "Developer Tooling",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    description: "Lightweight API benchmarking and JSON inspector utility built for quick backend debugging."
  },
  {
    id: "exp-5",
    title: "Aetheria Audio Visualizer",
    category: "Canvas Physics",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
    description: "Real-time frequency audio synthesizer reacting to microphone inputs with fluid particles."
  },
  {
    id: "exp-6",
    title: "Minimalist Terminal Portfolio",
    category: "CLI Interface",
    image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=800&q=80",
    description: "Interactive shell environment in the browser with custom command parsing and ASCII art."
  },
];
