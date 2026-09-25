import { Project, JournalEntry, TechSkill, ExplorationItem } from '../types';

export const warriorDetails = {
  name: "KashhCMD",
  title: "Web Designer & Discord Bot Developer",
  avatarUrl: "https://github.com/kashcmdd.png",
  bio: "I'm KashhCMD, a web designer and Discord bot developer who enjoys building modern digital experiences. My journey into programming started with curiosity and has grown into a passion for creating websites, applications, and tools that are both visually appealing and highly functional.",
  philosophy: "I believe that every line of code should have a purpose. I aim to write clean, maintainable, and scalable code while focusing on performance, accessibility, and user experience. Rather than simply making something work, I strive to create products that feel polished, intuitive, and enjoyable to use.",
  roles: ["Web Dev", "Discord Bot Dev"],
  discord: "",
};

export const projectsData: Project[] = [
  {
    id: "rainbow-leaderboard",
    title: "Rainbow Leaderboard",
    category: "Competitive Ladder Platform",
    subtitle: "ELO-Ranked Rainbow Six Siege Ladder with Tournaments, Seasons & Discord Auth",
    description: "A self-hosted competitive ranking platform for Rainbow Six Siege communities. Runs a Glicko-style ELO engine with provisional ratings, margin-of-victory weighting and inactivity decay across 1v1 through 5v5 formats, wrapped in a season and tournament system with visual bracket generation. Players authenticate through Discord OAuth2 with granular admin roles, and 41 hand-built SVG rank icons carry the leaderboard from Bronze through Champion. Ships with an admin panel (CSV bulk import, match editing, audit log), one-click CSV/JSON export, and a pytest suite.",
    image: "/portfolio/rainbow-leaderboard.png",
    tags: ["Python 3.12", "FastAPI", "PostgreSQL", "SQLAlchemy", "Alembic", "Jinja2", "Tailwind CSS", "Discord OAuth2", "APScheduler", "Docker"],
    githubUrl: "https://github.com/kashcmdd/rainbow-leaderboard",
    featured: true,
    colSpanDesktop: 12,
    aspectRatio: "aspect-[16/9]",
    highlights: [
      "Glicko-style ELO engine with provisional ratings, margin-of-victory weighting and inactivity decay",
      "Async SQLAlchemy 2.0 data layer on PostgreSQL 16, schema-versioned with Alembic migrations",
      "Docker Compose stack with APScheduler-driven rating decay and Discord OAuth2 admin roles",
    ],
  },
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
    id: "discord-music-bot",
    title: "Discord Music Bot",
    category: "Discord Bot Development",
    subtitle: "Multi-Source Music Bot with Web Dashboard, Premium Tiers & Docker Deploys",
    description: "A full-featured Discord music bot covering YouTube, Spotify and SoundCloud playback through a Lavalink-backed audio pipeline, with 25+ slash commands covering queue management, playback filters, lyrics and saved playlists. Adds a three-tier permission model (Free / Pro / VIP) that gates queue depth, volume ceiling, seek, autoplay and a 24/7 voice mode, enforced by both DJ-role checks and per-guild tier overrides. Ships with an OAuth2 web dashboard for remote configuration and a Docker image for one-command deployment.",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
    tags: ["Node.js", "Discord.js", "Lavalink", "yt-dlp", "ffmpeg", "Docker"],
    githubUrl: "https://github.com/kashcmdd/discord-music-bot",
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
  { name: "Next.js", category: "Frontend", icon: "Globe", level: "Proficient", description: "App Router, Server-Side Rendering, Dynamic API Proxy Routes" },
  { name: "TypeScript", category: "Frontend", icon: "FileCode", level: "Advanced", description: "Strict Typing, Generic Interfaces, Modular Codebases" },
  { name: "Tailwind CSS v4", category: "Frontend", icon: "Palette", level: "Expert", description: "Custom Theme Tokens, Responsive Liquid Layouts, Utility Design" },
  { name: "GSAP & Motion", category: "Frontend", icon: "Sparkles", level: "Advanced", description: "Scroll-Triggered Sequences, Layout Transitions, Spring Physics" },
  { name: "HTML5 & CSS3", category: "Frontend", icon: "Layout", level: "Expert", description: "Semantic Markup, Modern Flexbox/Grid, Glassmorphism FX" },

  // Backend
  { name: "Node.js", category: "Backend", icon: "Server", level: "Advanced", description: "Asynchronous I/O, Event Loop Optimization, Middleware Design" },
  { name: "Express.js", category: "Backend", icon: "Cpu", level: "Advanced", description: "RESTful Endpoint Architecture, Authentication, Middleware Pipeline" },
  { name: "Python & FastAPI", category: "Backend", icon: "Braces", level: "Advanced", description: "Async Route Handlers, Dependency Injection, Pydantic Schemas" },
  { name: "Discord.js", category: "Backend", icon: "Bot", level: "Expert", description: "Slash Commands, Premium Tier Gating, Sharding & Gateway Events" },
  { name: "REST & Async APIs", category: "Backend", icon: "Network", level: "Expert", description: "API Gateways, Rate Limiting, JSON Payload Serialization" },
  { name: "Jinja2 Templating", category: "Backend", icon: "Braces", level: "Proficient", description: "Server-Rendered Views, Template Inheritance, Escaped Output" },

  // Databases
  { name: "PostgreSQL 16", category: "Databases", icon: "Database", level: "Advanced", description: "Async Drivers, Relational Modelling, Indexing & Query Tuning" },
  { name: "SQLite", category: "Databases", icon: "HardDrive", level: "Advanced", description: "Lightweight Embedded Storage, Fast Local Query Execution" },
  { name: "Redis", category: "Databases", icon: "Activity", level: "Proficient", description: "Session Caching, Pub/Sub, Rate-Limit Backoff" },

  // DevOps
  { name: "Docker & Compose", category: "DevOps", icon: "Container", level: "Advanced", description: "Multi-Service Stacks, Image Layering, One-Command Deployment" },
  { name: "GitHub Actions", category: "DevOps", icon: "Workflow", level: "Advanced", description: "Push-Triggered Builds, Automated Pages Deployment, Matrix Jobs" },
  { name: "Linux & Process Ops", category: "DevOps", icon: "Terminal", level: "Proficient", description: "Service Supervision, Log Tailing, Shell Scripting" },

  // Tools
  { name: "Git & GitHub", category: "Tools", icon: "GitBranch", level: "Expert", description: "Version Control, Pull Requests, Automated Workflows" },
  { name: "VS Code & Postman", category: "Tools", icon: "SquareTerminal", level: "Expert", description: "Environment Workflows, API Inspection & Debugging" },
  { name: "Pterodactyl & Vercel", category: "Tools", icon: "Cloud", level: "Advanced", description: "Game Server Panels, Serverless Deployments, Custom Domains" },
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
