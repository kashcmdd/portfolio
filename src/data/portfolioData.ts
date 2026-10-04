import {
  Project,
  JournalEntry,
  TechSkill,
  ExplorationItem,
  CurrentlyBuilding,
  RecentWork,
  Architecture,
  ExperienceEntry,
  Testimonial,
} from '../types';

// Files in public/ are served from the Vite base, not the domain root, and a
// string in this module is a runtime <img src> that the bundler never rewrites.
// BASE_URL already carries the trailing slash and follows base in vite.config.ts.
const asset = (file: string) => `${import.meta.env.BASE_URL}${file}`;

/*
 * Architecture diagrams (#19).
 *
 * Every node and edge here is traceable to the project's own description, tags
 * or highlights - nothing is inferred. If a project gains or drops a component,
 * the diagram has to change with it, or it stops being a description and starts
 * being decoration.
 */
const scriptforgeArchitecture: Architecture = {
  summary:
    'A single Next.js application serves the device and script UI and its own API. Every mutating route is CSRF-protected and runs through a version service that keeps concurrent edits from clobbering each other, and a GPC parser handles the script bodies. Accounts, sessions and all persistent state live in SQLite, with 75 unit and end-to-end tests covering the paths.',
  layers: [
    { title: 'Client' },
    { title: 'Application' },
    { title: 'Services' },
    { title: 'State & Tests' },
  ],
  nodes: [
    { id: 'ui', label: 'Device & Script UI', detail: 'React + Tailwind', layer: 0 },
    { id: 'routes', label: 'API Routes', detail: 'CSRF-protected', layer: 1 },
    { id: 'accounts', label: 'Accounts', detail: 'self-serve', layer: 1 },
    { id: 'versioning', label: 'Version Service', detail: 'conflict-safe', layer: 2 },
    { id: 'parser', label: 'GPC Parser', layer: 2 },
    { id: 'sessions', label: 'Session Guard', detail: 'invalidation', layer: 2 },
    { id: 'sqlite', label: 'SQLite', detail: 'transactions', layer: 3 },
    { id: 'vitest', label: 'Vitest', detail: '75 unit + e2e', layer: 3 },
  ],
  edges: [
    { from: 'ui', to: 'routes', label: 'typed fetch' },
    { from: 'ui', to: 'accounts' },
    { from: 'routes', to: 'versioning', label: 'transaction' },
    { from: 'routes', to: 'parser' },
    { from: 'accounts', to: 'sessions' },
    { from: 'versioning', to: 'sqlite' },
    { from: 'sessions', to: 'sqlite' },
    { from: 'routes', to: 'vitest', label: 'covered by' },
    { from: 'versioning', to: 'vitest', label: 'covered by' },
  ],
};

const musicBotArchitecture: Architecture = {
  summary:
    'The bot process and the audio work are split. discord.js handles 25-odd slash commands in the guild and defers every playback request to a separate Lavalink node, which pulls and decodes tracks through yt-dlp and ffmpeg. A three-tier permission model sits in front of playback, checked against both DJ roles and per-guild overrides, and an OAuth2 web dashboard can change that configuration remotely. The whole thing ships as a single Docker image.',
  layers: [
    { title: 'Client' },
    { title: 'Bot' },
    { title: 'Services' },
    { title: 'Audio & State' },
  ],
  nodes: [
    { id: 'voice', label: 'Guild Voice', detail: 'incl. 24/7 mode', layer: 0 },
    { id: 'dash', label: 'Web Dashboard', detail: 'OAuth2', layer: 0 },
    { id: 'cmds', label: 'Slash Commands', detail: '25+', layer: 1 },
    { id: 'guards', label: 'Tier + DJ Guards', detail: 'Free / Pro / VIP', layer: 2 },
    { id: 'lavalink', label: 'Lavalink Node', detail: 'audio pipeline', layer: 2 },
    { id: 'config', label: 'Config API', detail: 'remote config', layer: 2 },
    { id: 'playlists', label: 'Saved Playlists', layer: 2 },
    { id: 'sources', label: 'yt-dlp + ffmpeg', detail: 'YT / Spotify / SC', layer: 3 },
    { id: 'tiers', label: 'Per-Guild Tiers', layer: 3 },
  ],
  edges: [
    { from: 'voice', to: 'cmds' },
    { from: 'dash', to: 'config' },
    { from: 'cmds', to: 'guards' },
    { from: 'cmds', to: 'lavalink' },
    { from: 'cmds', to: 'config' },
    { from: 'cmds', to: 'playlists' },
    { from: 'guards', to: 'tiers' },
    { from: 'config', to: 'tiers' },
    { from: 'lavalink', to: 'sources' },
  ],
};

const melonArchitecture: Architecture = {
  summary:
    'A maintained fork of the Melon multipurpose bot. One hybrid router accepts both prefix and slash commands and dispatches into feature modules for antinuke protection, automod, AI chat, tickets, giveaways, join-to-create voice and autopost. Those modules never talk to a database directly: everything goes through Sequelize, which keeps the fork manageable when the upstream bot changes shape.',
  layers: [
    { title: 'Guild' },
    { title: 'Command Layer' },
    { title: 'Feature Modules' },
    { title: 'Persistence' },
    { title: 'Storage' },
  ],
  nodes: [
    { id: 'guild', label: 'Discord Guild', detail: 'prefix + slash', layer: 0 },
    { id: 'router', label: 'Hybrid Router', detail: 'both command styles', layer: 1 },
    { id: 'antinuke', label: 'Antinuke', detail: 'protection', layer: 2 },
    { id: 'automod', label: 'Automod', layer: 2 },
    { id: 'ai', label: 'AI Chat', layer: 2 },
    { id: 'tickets', label: 'Tickets + Giveaways', layer: 2 },
    { id: 'voice', label: 'Voice + Autopost', layer: 2 },
    { id: 'orm', label: 'Sequelize ORM', layer: 3 },
    { id: 'pg', label: 'PostgreSQL', layer: 4 },
  ],
  edges: [
    { from: 'guild', to: 'router' },
    { from: 'router', to: 'antinuke' },
    { from: 'router', to: 'automod' },
    { from: 'router', to: 'ai' },
    { from: 'router', to: 'tickets' },
    { from: 'router', to: 'voice' },
    { from: 'antinuke', to: 'orm' },
    { from: 'automod', to: 'orm' },
    { from: 'tickets', to: 'orm' },
    { from: 'orm', to: 'pg' },
  ],
};

const nebulaArchitecture: Architecture = {
  summary:
    'Two repositories: a deployment layer that pins Red-DiscordBot as a dependency (no fork) and scripts install, cog selection, backups and updates, and a set of original cogs. The centrepiece is a DeepSeek-backed cog: a mention carries the message text and any images to the model, which replies with tool calls. Those calls run against the live guild through a permission gate that checks the requester\u2019s own Discord permissions and the role hierarchy, and every action is logged. The same cog posts join-time welcome messages and button role menus.',
  layers: [
    { title: 'Discord' },
    { title: 'Entry points' },
    { title: 'Assistant' },
    { title: 'Guards' },
    { title: 'Runtime' },
    { title: 'State' },
  ],
  nodes: [
    { id: 'guild', label: 'Discord Guild', detail: 'members \u2022 roles \u2022 channels', layer: 0 },
    { id: 'mention', label: 'Mention / !ai', detail: 'text + images', layer: 1 },
    { id: 'welcome', label: 'Welcome + Role Menus', detail: 'join + buttons', layer: 1 },
    { id: 'model', label: 'DeepSeek Flash', detail: 'vision + tools', layer: 2 },
    { id: 'tools', label: 'Tool Layer', detail: '70+ tools', layer: 2 },
    { id: 'perms', label: 'Permission Gate', detail: "requester's own perms", layer: 3 },
    { id: 'red', label: 'Red-DiscordBot', detail: '20 cogs', layer: 4 },
    { id: 'scripts', label: 'PowerShell Scripts', detail: 'install \u2022 backup', layer: 4 },
    { id: 'data', label: 'Config + Data', detail: 'gitignored', layer: 5 },
  ],
  edges: [
    { from: 'guild', to: 'mention', label: 'message' },
    { from: 'guild', to: 'welcome', label: 'member joins' },
    { from: 'mention', to: 'model', label: 'prompt + image' },
    { from: 'model', to: 'tools', label: 'tool call' },
    { from: 'welcome', to: 'tools', label: 'post' },
    { from: 'tools', to: 'perms', label: 'gated by' },
    { from: 'perms', to: 'red', label: 'act via' },
    { from: 'red', to: 'data' },
    { from: 'scripts', to: 'data' },
  ],
};

export const warriorDetails = {
  name: "KashhCMD",
  title: "Web Designer & Discord Bot Developer",
  avatarUrl: "https://github.com/kashcmdd.png",
  githubUrl: "https://github.com/kashcmdd",
  githubHandle: "kashcmdd",
  bio: "I'm KashhCMD, a web designer and Discord bot developer who enjoys building modern digital experiences. My journey into programming started with curiosity and has grown into a passion for creating websites, applications, and tools that are both visually appealing and highly functional.",
  philosophy: "I believe that every line of code should have a purpose. I aim to write clean, maintainable, and scalable code while focusing on performance, accessibility, and user experience. Rather than simply making something work, I strive to create products that feel polished, intuitive, and enjoyable to use.",
  roles: ["Web Dev", "Discord Bot Dev"],
  discord: "",
};

export const projectsData: Project[] = [
  {
    id: "rainbow-leaderboard",
    title: "Rainbow Leaderboard",
    kind: "Web",
    category: "Competitive Ladder Platform",
    subtitle: "ELO-Ranked Rainbow Six Siege Ladder with Tournaments, Seasons & Discord Auth",
    outcome: "Replaces ad-hoc spreadsheet ladders with a self-hosted, audited ranking platform a community can run itself.",
    description: "A self-hosted competitive ranking platform for Rainbow Six Siege communities. Runs a Glicko-style ELO engine with provisional ratings, margin-of-victory weighting and inactivity decay across 1v1 through 5v5 formats, wrapped in a season and tournament system with visual bracket generation. Players authenticate through Discord OAuth2 with granular admin roles, and 41 hand-built SVG rank icons carry the leaderboard from Bronze through Champion. Ships with an admin panel (CSV bulk import, match editing, audit log), one-click CSV/JSON export, and a pytest suite.",
    image: asset("rainbow-leaderboard.webp"),
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
    kind: "Full-Stack",
    category: "Full-Stack Web App",
    subtitle: "Controller-Script Hub for Streaming Devices",
    outcome: "Turns risky, manual device-script edits into versioned, conflict-safe changes a whole team can make.",
    description: "A Next.js controller-script hub: device & script management, transactional script editing with conflict-safe versions, self-serve accounts with session invalidation and account deletion, CSRF-protected APIs, a GPC script parser, and 75 unit + end-to-end tests.",
    image: asset("scriptforge-placeholder.svg"),
    tags: ["Next.js", "React", "TypeScript", "Tailwind CSS", "SQLite", "Vitest"],
    githubUrl: "https://github.com/kashcmdd/scriptforge",
    featured: true,
    colSpanDesktop: 7,
    aspectRatio: "aspect-[16/10]",
    // Real bullets, written from the project's own description. The modal and the
    // generated page both fall back to a generic trio when this is absent, and a
    // generic "liquid glass UI" line on a server-rendered Next.js app reads as
    // filler, so every project carries its own.
    highlights: [
      "Transactional script editing with conflict-safe versions",
      "Self-serve accounts with session invalidation and account deletion",
      "CSRF-protected APIs and a GPC script parser",
      "75 unit and end-to-end tests across the routes and the version service",
    ],
    architecture: scriptforgeArchitecture,
  },
  {
    id: "discord-music-bot",
    title: "Discord Music Bot",
    kind: "Discord",
    category: "Discord Bot Development",
    subtitle: "Multi-Source Music Bot with Web Dashboard, Premium Tiers & Docker Deploys",
    outcome: "One bot across three streaming sources, configured from a dashboard and deployed with a single Docker command.",
    description: "A full-featured Discord music bot covering YouTube, Spotify and SoundCloud playback through a Lavalink-backed audio pipeline, with 25+ slash commands covering queue management, playback filters, lyrics and saved playlists. Adds a three-tier permission model (Free / Pro / VIP) that gates queue depth, volume ceiling, seek, autoplay and a 24/7 voice mode, enforced by both DJ-role checks and per-guild tier overrides. Ships with an OAuth2 web dashboard for remote configuration and a Docker image for one-command deployment.",
    image: asset("discord-music-bot-placeholder.svg"),
    tags: ["Node.js", "Discord.js", "Lavalink", "yt-dlp", "ffmpeg", "Docker"],
    githubUrl: "https://github.com/kashcmdd/discord-music-bot",
    featured: true,
    colSpanDesktop: 5,
    aspectRatio: "aspect-[4/3]",
    highlights: [
      "YouTube, Spotify and SoundCloud playback through a Lavalink audio pipeline",
      "25+ slash commands covering queue, filters, lyrics and saved playlists",
      "Free / Pro / VIP tiers enforced by DJ roles and per-guild overrides",
      "OAuth2 web dashboard and a one-command Docker image",
    ],
    architecture: musicBotArchitecture,
    // The command surface, grouped the way the bot's own description already
    // groups it. inviteUrl / supportUrl / stats are left unset on purpose: there
    // is no public invite or live count to cite yet, and the modal renders each
    // of those only when it is present, so nothing false ships in the meantime.
    commands: [
      { group: "Queue", detail: "Add, remove, move, shuffle and loop tracks in the active queue" },
      { group: "Playback filters", detail: "Live audio filters applied to the current track" },
      { group: "Lyrics", detail: "Fetch the lyrics for whatever is playing" },
      { group: "Saved playlists", detail: "Save and reload per-guild playlists" },
    ],
  },
  {
    id: "melon",
    title: "Melon",
    kind: "Discord",
    category: "Discord Moderation",
    subtitle: "Maintained Fork of an All-in-One Multipurpose Bot",
    outcome: "Keeps a large, long-lived community bot maintainable — security fixes and moderation kept current instead of rotting.",
    description: "A maintained fork of the Melon multipurpose bot — antinuke protection, automod, AI chat, tickets, giveaways, join-to-create voice, autopost and more, on hybrid prefix + slash commands with Sequelize-backed Postgres state.",
    image: asset("melon.webp"),
    tags: ["Discord.js", "Node.js", "PostgreSQL", "Sequelize"],
    githubUrl: "https://github.com/kashcmdd/Melon-All-In-One-Discord-Bot",
    featured: true,
    colSpanDesktop: 5,
    aspectRatio: "aspect-[4/3]",
    highlights: [
      "Hybrid prefix and slash commands behind a single router",
      "Antinuke, automod, tickets, giveaways and join-to-create voice modules",
      "Sequelize over PostgreSQL, so feature modules never touch the database directly",
    ],
    architecture: melonArchitecture,
    commands: [
      { group: "Moderation", detail: "Antinuke protection and automod" },
      { group: "Community", detail: "Tickets, giveaways and join-to-create voice" },
      { group: "Engagement", detail: "AI chat and autopost" },
    ],
  },
  {
    id: "kashhcmd-portfolio",
    title: "KashhCMD Portfolio",
    kind: "Web",
    category: "Web Design & Frontend",
    subtitle: "Liquid Glass Landing Page, Deployed on GitHub Pages",
    outcome: "Reads as fully crawlable static pages to crawlers and as a native-feeling app to visitors, on a small first-paint budget.",
    description: "This site — a cinematic dark portfolio with liquid glass visuals, GSAP animations and HLS video backgrounds, personalized and continuously deployed to GitHub Pages through a push-triggered Actions workflow.",
    image: asset("portfolio-site.webp"),
    tags: ["React 19", "Vite", "TypeScript", "Tailwind CSS v4", "GSAP", "GitHub Pages"],
    githubUrl: "https://github.com/kashcmdd/portfolio",
    liveUrl: "https://kashcmdd.github.io/portfolio/",
    featured: true,
    colSpanDesktop: 7,
    aspectRatio: "aspect-[16/10]",
    highlights: [
      "Liquid glass design tokens in Tailwind v4, composed over a responsive 12-column bento grid",
      "HLS video backgrounds gated by IntersectionObserver, with the 594 kB parser lazy-loaded and skipped entirely on native-HLS browsers",
      "Push-to-deploy Pages workflow with vendor code-splitting holding first-paint JS to about 585 kB",
    ],
    demoUrl: "https://kashcmdd.github.io/portfolio/",
    demoDescription: "Live portfolio with liquid glass effects, video backgrounds, and interactive animations",
    demoFeatures: [
      "GSAP Animations",
      "Video Backgrounds",
      "Liquid Glass UI",
      "12-Column Grid"
    ],
  },
  {
    id: "nebula",
    title: "Nebula",
    kind: "Discord",
    category: "Self-Hosted Bot Platform",
    subtitle: "AI-Operable Discord Bot on a Reproducible Red-DiscordBot Deployment",
    outcome: "Turns running a server into a conversation: mention the bot and it reads or changes the server itself, with every action gated on the requester's own Discord permissions.",
    description: "A self-hosted Discord bot built on Red-DiscordBot, split across two repositories — a reproducible deployment layer (a pinned Red dependency rather than a fork, scripted install, cog selection, backups, updates and branding) and a set of original cogs. The centrepiece is a DeepSeek-backed cog that gives the model 70+ tools, so it can read live server state (roles, channels, members, the audit log) and act on it: create, rename, reorder and delete channels and roles, set permission overwrites, kick, ban, timeout and prune members, post and edit embeds, and manage webhooks, emojis, stickers, AutoMod rules, scheduled events, threads and voice state, plus self-assignable role menus posted as buttons. It also reads image attachments (vision) and posts automatic welcome messages. Every action is checked against the requester's permissions at execution time rather than the bot's, applied with role-hierarchy rules, and logged.",
    image: asset("nebula-placeholder.svg"),
    tags: ["Python", "Red-DiscordBot", "discord.py", "DeepSeek", "Tool Calling", "PowerShell", "Windows"],
    githubUrl: "https://github.com/kashcmdd/nebula",
    repoUrl: "https://github.com/kashcmdd/nebula-cogs",
    featured: true,
    colSpanDesktop: 7,
    aspectRatio: "aspect-[16/10]",
    highlights: [
      "Custom deepseek cog exposes 70+ tools, so the model can read and change the server rather than only talk about it",
      "Action tools are gated on the requester's own Discord permissions at execution time, with role-hierarchy checks and logging",
      "Reproducible Windows deployment: pinned Red dependency (no fork), scripted install, cog selection, backups and updates",
      "Vision, button role menus, scheduled events, AutoMod and welcome messages, from two repositories",
    ],
    architecture: nebulaArchitecture,
    commands: [
      { group: "AI assistant", detail: "!ai or @Nebula — ask about, or change, the server; reads image attachments" },
      { group: "Server tools", detail: "channels, roles, permissions, members, messages, webhooks, emojis, events, AutoMod, voice" },
      { group: "Community", detail: "button role menus, automatic welcome messages, trivia and economy" },
      { group: "Moderation", detail: "kick, ban, timeout, prune, warnings, mutes, filters and cleanup" },
    ],
  },
];

/**
 * The experience timeline.
 *
 * A recruiter scans for "what, with whom, when". With a self-directed body of
 * work there is no employer to name, so the milestones are the projects
 * themselves and the summary is each project's own `outcome` line — the same
 * sentence the card and the case study already show, so the three can never
 * drift apart.
 *
 * The periods are real. The months come from the repositories' own first
 * commits; a project whose history was not available carries the bare year
 * instead of a made-up month, because a timeline that invents detail is worse
 * than one that admits the limit of what it knows.
 */
const experiencePeriods: Record<string, string> = {
  'kashhcmd-portfolio': 'Sep 2026',
  'rainbow-leaderboard': 'Jun 2026',
  melon: 'Jun 2026',
  scriptforge: '2026',
  'discord-music-bot': '2026',
};

// Newest first, which is the order the timeline reads top to bottom.
const experienceOrder = [
  'kashhcmd-portfolio',
  'rainbow-leaderboard',
  'melon',
  'scriptforge',
  'discord-music-bot',
];

export const experienceData: ExperienceEntry[] = experienceOrder
  .map((id) => projectsData.find((project) => project.id === id))
  .filter((project): project is Project => Boolean(project))
  .map((project) => ({
    id: `work-${project.id}`,
    period: experiencePeriods[project.id] ?? '2026',
    title: project.title,
    org: project.kind === 'Discord' ? 'Discord bot — independent' : 'Web app — independent',
    summary: project.outcome ?? project.subtitle,
    stack: project.tags.slice(0, 6),
    projectId: project.id,
  }));

/**
 * Quotes from real people. Intentionally empty.
 *
 * The section that consumes this returns null while the list is empty, so there
 * is no invented praise to remember to delete later. Add objects shaped like
 * { quote, author, role?, url? } and the section appears on its own.
 */
export const testimonialsData: Testimonial[] = [];

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
    id: "elo-decay",
    title: "Your Ladder Needs to Forget",
    subtitle: "Rating decay is the least interesting part of a ranked system to build, and the easiest thing to get wrong.",
    date: "SEP 25, 2026",
    readTime: "7 MIN READ",
    category: "ALGORITHMS",
    decision: {
      chose: "A decay floor at the current rank, linear and capped",
      over: "Decaying towards zero on a fixed daily subtraction",
    },
    image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=800&q=80",
    content: [
      {
        type: "paragraph",
        text: "Every ranked ladder eventually develops a aristocracy. A handful of players grind the ladder for a season, hit the top rank, and then log off for a year. They are still at the top of the board, not because they are the best players on the server right now, but because nobody has taken their place. Newcomers are measured against a benchmark that stopped being true months ago.",
      },
      {
        type: "paragraph",
        text: "The fix is decay: a background job that quietly reduces the rating of anyone who has not played within a cutoff window. It is about forty lines of code. Almost every interesting decision in it is about how much to remove and where to stop.",
      },
      { type: "heading", text: "Decaying to zero is the wrong answer" },
      {
        type: "paragraph",
        text: "The naive implementation subtracts a fixed amount per day of inactivity until the player hits the bottom of the scale. It works, and it is too harsh. A Diamond who has not logged in for two months should not wake up to Bronze, because the punishment massively exceeds the offence and almost every affected player quits rather than grinding their way back.",
      },
      {
        type: "paragraph",
        text: "So the decay has a floor, and the floor is not zero. It is the rating at the bottom of whatever rank the player currently holds. They slide down through the tiers of their own band and stop, keeping the rank they earned. You only lose ground to people who are actually showing up.",
      },
      {
        type: "code",
        language: "python",
        caption: "app/elo.py — decay floors at the current rank threshold, never at zero",
        code: `min_elo = 0
for name, threshold, _ in reversed(RANKS):
    if r.elo >= threshold:
        min_elo = threshold
        break

new_elo = max(r.elo - decay, min_elo)`,
      },
      { type: "heading", text: "Linear, and capped" },
      {
        type: "paragraph",
        text: "Decay is linear in days inactive, not exponential. A player away for a year should not be punished as if they had been away for three, so the total removed is clamped by a max_decay setting.",
      },
      {
        type: "code",
        language: "python",
        caption: "main.py — linear decay, clamped",
        code: `days_inactive = (datetime.now(timezone.utc) - r.last_active).days
decay = min(days_inactive * settings.decay_per_day, settings.max_decay)`,
      },
      {
        type: "paragraph",
        text: "The query also filters on player_id being non-null. Ratings that are not linked to an actual player never decay, because a team-only or unattributed rating drifting downward on a timer is a bug that looks like a feature until someone notices their team rating fell for no reason.",
      },
      { type: "heading", text: "Auditing the machine" },
      {
        type: "paragraph",
        text: "The part I care about most: decay writes an audit log entry attributed to a system actor, exactly as if an administrator had made the change by hand. A rating that moves without a human touching it should be as traceable as one that did, and when a player disputes their rank six months later, that log row is the answer.",
      },
      {
        type: "code",
        language: "python",
        code: `db.add(AuditLog(
    admin_id="system",
    admin_name="System",
    action="elo_decay",
    target_id=str(r.player_id) if r.player_id else None,
    details=f"Decayed {actual_decay} ELO after {days_inactive} days inactive",
))`,
      },
      { type: "heading", text: "Scheduling it without shooting yourself" },
      {
        type: "paragraph",
        text: "APScheduler runs the job once a day inside the FastAPI lifespan. Two of its options are doing real work here and are easy to miss:",
      },
      {
        type: "list",
        items: [
          "max_instances=1 stops a slow run from overlapping the next one. Decay touches every stale rating in a single transaction, and two concurrent runs will fight over the same rows.",
          "misfire_grace_time=3600 lets the job still run after a deploy or a crash, as long as it is within the hour. Otherwise every restart silently skips a day of decay.",
        ],
      },
      {
        type: "paragraph",
        text: "The whole job body is wrapped in a bare except that logs and swallows. A decay run that throws should not take the web app down with it, and it should leave a trace that says exactly which run failed.",
      },
      { type: "heading", text: "The part that is easy to forget" },
      {
        type: "paragraph",
        text: "Top positions on the leaderboard are exclusive: there is a first, a second, a third. Decay reshuffles the top of the table, which means the position numbers are now wrong for everyone above the highest decayed player. The job finishes by recalculating top positions and committing again. Without that step the board shows stale placements, and it will look like a data integrity bug rather than a missing recalculation.",
      },
    ],
  },
  {
    id: "bundle-splitting",
    title: "Cutting 59% Off My Portfolio's JavaScript",
    subtitle: "One static import was costing more than React, the router and every icon combined.",
    date: "SEP 25, 2026",
    readTime: "6 MIN READ",
    category: "PERFORMANCE",
    decision: {
      chose: "Lazy-loading the 594 kB HLS parser on demand",
      over: "A single static import paid for by every visitor",
    },
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    content: [
      {
        type: "paragraph",
        text: "The build was telling me something I had been ignoring: a single chunk over 500 kB, and a warning that nobody was going to read but me. The bundle was 1,076 kB raw, 340 kB gzipped, shipped as one file to every visitor. I went looking for what was actually in there instead of guessing.",
      },
      {
        type: "paragraph",
        text: "The answer was hls.js. One dependency, 594 kB raw and 185 kB gzipped, imported at the top of a component that draws video backgrounds. It was the single largest thing on the site by a wide margin, and it was never needed for most of the page.",
      },
      { type: "heading", text: "It was already behind an IntersectionObserver" },
      {
        type: "paragraph",
        text: "The video background component only initialises playback once its container comes within 200px of the viewport. The lazy behaviour was already written. What was missing was that the parser itself was being downloaded up front, before any of that logic got a chance to run.",
      },
      {
        type: "code",
        language: "tsx",
        caption: "A type-only import costs nothing at build time; the dynamic import defers the payload",
        code: `import type HlsType from 'hls.js';

// ...inside the effect, which only runs once the container is visible
const { default: Hls } = await import('hls.js');`,
      },
      {
        type: "paragraph",
        text: "Because the observer gate already existed, the change was small: turn the static import into a dynamic one inside the effect, keep a type-only import for the variable so TypeScript still knows what hls is, and guard against the component unmounting while the chunk is in flight. The 594 kB now arrives when a video background actually scrolls into view, and not before.",
      },
      { type: "heading", text: "Safari does not need the parser at all" },
      {
        type: "paragraph",
        text: "HLS is a format Safari plays natively. Loading 594 kB of JavaScript to hand the browser a URL it can already handle is pure waste, so the native check happens before the dynamic import, not after it.",
      },
      {
        type: "code",
        language: "tsx",
        code: `if (video.canPlayType('application/vnd.apple.mpegurl') && hlsSource) {
  video.src = hlsSource;
  video.play().catch(() => {});
  return;
}`,
      },
      { type: "heading", text: "Splitting the rest" },
      {
        type: "paragraph",
        text: "With hls out of the way, the remainder was still a single 470 kB file. Splitting the vendors into named chunks does not reduce the total number of bytes anyone downloads, but it means React, the animation library and the icon set are cached independently of your app code. Shipping a one-line copy change no longer invalidates a megabyte of vendor JavaScript in everyone's browser.",
      },
      {
        type: "code",
        language: "ts",
        caption: "vite.config.ts",
        code: `build: {
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (!id.includes('node_modules')) return;
        if (id.includes('hls.js')) return 'hls';
        if (id.includes('gsap')) return 'gsap';
        if (id.includes('framer-motion') || id.includes('node_modules/motion'))
          return 'motion';
        if (id.includes('lucide-react')) return 'icons';
        if (
          id.includes('node_modules/react/') ||
          id.includes('node_modules/react-dom/') ||
          id.includes('node_modules/scheduler/')
        )
          return 'react';
      },
    },
  },
}`,
      },
      { type: "heading", text: "Verifying it actually happened" },
      {
        type: "paragraph",
        text: "A bundle size table is easy to fool yourself with, so the check is in the built HTML. If the lazy chunk is still listed as a modulepreload, the browser is fetching it eagerly regardless of what the code says, and none of this mattered.",
      },
      {
        type: "code",
        language: "html",
        caption: "hls is absent from this list, which is the entire point",
        code: `<link rel="modulepreload" href="/portfolio/assets/react-DGj8QgOs.js">
<link rel="modulepreload" href="/portfolio/assets/motion-BA6OqAxL.js">
<link rel="modulepreload" href="/portfolio/assets/icons-C8CewcuE.js">
<link rel="modulepreload" href="/portfolio/assets/gsap-CzGW6FVa.js">
<!-- no hls -->`,
      },
      {
        type: "quote",
        text: "Initial JavaScript went from 1,076 kB to about 440 kB. The hls chunk is still 595 kB, it just is not your problem until you scroll to it.",
      },
      {
        type: "paragraph",
        text: "Those figures are from the day of the change, and the site has grown a lot since: the journal, the command palette, the case-study modals, the decision log and the architecture diagrams all landed afterwards. First paint measures about 585 kB today, still spread across the same five cached chunks. That is not the exercise failing. Splitting was never a promise that the number would stay small, only that a growing one keeps arriving in pieces the browser can cache separately.",
      },
    ],
  },
  {
    id: "sqlite-postgres",
    title: "SQLite Is Fine Until It Isn't",
    subtitle: "Two of my projects use the same data, in two completely different databases, for two completely different reasons.",
    date: "SEP 25, 2026",
    readTime: "5 MIN READ",
    category: "ARCHITECTURE",
    decision: {
      chose: "SQLite for the single-node app, Postgres for the bot",
      over: "Reaching for one database everywhere",
    },
    image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80",
    content: [
      {
        type: "paragraph",
        text: "ScriptForge stores its users, scripts and version history in a single SQLite file through better-sqlite3. Rainbow Leaderboard runs Postgres 16 through an async driver. Same person, same week, opposite decisions, and neither one is wrong.",
      },
      { type: "heading", text: "What ScriptForge gets from a file" },
      {
        type: "paragraph",
        text: "ScriptForge is a single Node process serving one deployment. Its entire dataset is a file on a disk. There is no replication to configure, no connection pool to size, nothing to administer at three in the morning, and the whole database can be backed up by copying one file. For a single-node deployment that is not a compromise, it is the correct choice.",
      },
      {
        type: "code",
        language: "bash",
        caption: "The environment variable that decides where the file lives",
        code: `DATABASE_PATH=./data.sqlite`,
      },
      {
        type: "paragraph",
        text: "better-sqlite3 is also synchronous, which in a Next.js route handler is simply convenient. There is no connection pool to leak and no await on the query path.",
      },
      { type: "heading", text: "Where the ceiling is" },
      {
        type: "paragraph",
        text: "SQLite serialises writes. That is the whole trade. It is invisible until you have concurrent writers, and then it appears as lock contention rather than as a database error, which makes it harder to diagnose. My own note in that repository says it plainly:",
      },
      {
        type: "quote",
        text: "SQLite is fine for a single-node hobby deployment; move lib/db.ts queries to Postgres before you expect concurrency.",
        attribution: "ScriptForge README",
      },
      { type: "heading", text: "What forced Postgres" },
      {
        type: "paragraph",
        text: "Rainbow Leaderboard has scheduled work. A daily decay job walks every stale rating, writes an audit row for each one, recalculates exclusive top positions, and commits twice. Meanwhile the leaderboard, player profile and stats endpoints are all being read. That is concurrent writers against readers, and it is the exact workload SQLite is worst at.",
      },
      {
        type: "code",
        language: "python",
        caption: "Async SQLAlchemy session over asyncpg",
        code: `DATABASE_URL=postgresql+asyncpg://rainbow:rainbow@db:5432/rainbow`,
      },
      {
        type: "paragraph",
        text: "Postgres also gives the schema changes a home. Alembic versions every migration, so a scheduled job and a running server can never disagree about what the rating table looks like. SQLite would have needed that discipline maintained by hand.",
      },
      { type: "heading", text: "The actual lesson" },
      {
        type: "paragraph",
        text: "The mistake is treating this as a preference. A file-backed database and a client-server database are different tools, and the honest version of the README line above is the one I would write if I were starting again: pick SQLite while you have exactly one writer and no scheduled jobs, and migrate before you add either. Both of these projects are the same person, and the difference between them is the workload, not taste.",
      },
    ],
  },
  {
    id: "base-paths",
    title: "No Router, No Server, No 404",
    subtitle: "This site lives under a subpath on GitHub Pages, which turns every URL question into a build-time one.",
    date: "SEP 25, 2026",
    readTime: "6 MIN READ",
    category: "DEPLOYMENT",
    decision: {
      chose: "A static, build-time URL scheme with no client router",
      over: "A runtime router that has to reinvent the base path",
    },
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    content: [
      {
        type: "paragraph",
        text: "I ship this site to GitHub Pages, so it does not live at the root of a domain. It lives at /portfolio/. That one directory in front changes how every absolute URL in the project behaves, and the resolution happens at build time rather than at runtime, which means a URL can be perfectly correct on your machine and still 404 in production.",
      },
      { type: "heading", text: "One line decides where the site lives" },
      {
        type: "code",
        language: "ts",
        caption: "vite.config.ts — the only line that knows the deployment target",
        code: `base: '/portfolio/',`,
      },
      {
        type: "paragraph",
        text: "Everything downstream is a consequence of it. Asset imports, script tags and stylesheet links get the prefix applied automatically, so those were never a problem. The interesting failures come from paths Vite does not obviously own.",
      },
      { type: "heading", text: "Hand-written paths are not rewritten for you" },
      {
        type: "paragraph",
        text: "I self-host the fonts, and the @font-face rules live in a CSS file I wrote by hand. They referenced the files with a plain root-relative url, which resolves against the domain root:",
      },
      {
        type: "code",
        language: "css",
        caption: "src/fonts.css — as written, before the build",
        code: `src: url('/fonts/inter-normal-latin.woff2') format('woff2');`,
      },
      {
        type: "paragraph",
        text: "Point that at localhost and it resolves. Point it at kashcmdd.github.io and it resolves to kashcmdd.github.io/fonts/inter-normal-latin.woff2, a 404 on the exact file the browser needs before it can render a single character. Vite does walk the output and prefix matching public assets, but only if you believe it. So I grep the built CSS instead:",
      },
      {
        type: "code",
        language: "css",
        caption: "dist/assets/*.css — what actually ships",
        code: `src: url('/portfolio/fonts/inter-normal-latin.woff2') format('woff2');`,
      },
      {
        type: "paragraph",
        text: "The rewrite happens. It is still worth checking once, because the cost of being wrong is invisible in development and total in production, and there is no error anywhere telling you that your fonts are being requested from the wrong origin.",
      },
      { type: "heading", text: "Metadata refuses to be relative" },
      {
        type: "paragraph",
        text: "The same intuition, applied to the wrong place, breaks sharing. Open Graph image URLs must be absolute, not because crawlers are incapable of resolving a relative reference, but because they may resolve it against a URL you never intended. Canonical links are the same: a canonical is a statement about where content permanently lives, and a partial path is not a location.",
      },
      {
        type: "code",
        language: "html",
        caption: "index.html — absolute, always",
        code: `<meta property="og:image"
      content="https://kashcmdd.github.io/portfolio/og-image.jpg" />`,
      },
      { type: "heading", text: "A static host has no rewrite rules" },
      {
        type: "paragraph",
        text: "This is the part that decides your routing library. A client-side router wants to own URLs like /journal/your-ladder-needs-to-forget, which requires the server to serve the app shell for any unknown path. GitHub Pages has no such rule. Refresh a deep link and you get a real 404 from a page that genuinely exists.",
      },
      {
        type: "paragraph",
        text: "There is a well-known workaround: drop a 404.html at the site root that reads the path and redirects into the app. It works, and it costs a client-side redirect, a flash of a blank page, and a response whose status code says the page is missing when it is not. For a portfolio, I would rather have the correct status code and no flicker.",
      },
      {
        type: "paragraph",
        text: "Hash routing sidesteps all of it. /#/journal/slug is a fragment, so the server only ever sees the shell, refresh always works, and the back button behaves. It also costs nothing to adopt here: navigation in this app was already driven by scrollIntoView, not by href anchors, so nothing else was using the hash and no sections had to be renamed.",
      },
      {
        type: "code",
        language: "ts",
        caption: "The entire routing layer",
        code: `const match = location.hash.match(/^#journal\\/([a-z0-9-]+)$/);
if (match) openEntry(match[1]);`,
      },
      { type: "heading", text: "Crawlers still do not run it" },
      {
        type: "paragraph",
        text: "Hash routing fixes refresh for humans and fixes nothing for scrapers. The Facebook and Twitter link previewers do not execute JavaScript, so every hash URL they ever fetch returns the same index.html with the same site-level title. Your article has no identity in a link preview.",
      },
      {
        type: "paragraph",
        text: "The fix is to stop asking the SPA to be the shareable thing. A step after vite build writes a real HTML file for every article, containing that article's title, description, image and rendered body, served at its own path. The path URL is what gets canonicalised and copied; the hash URL is what the app uses to open the modal on top of a section you were already reading.",
      },
      {
        type: "list",
        ordered: true,
        items: [
          "Build, then grep the output rather than trusting the config.",
          "Request every asset from the preview server and confirm the status code, not just that the file exists in dist.",
          "Confirm each generated article page returns 200 with its own meta tags.",
          "Treat an absolute URL in metadata as required, and a relative one as a bug.",
        ],
      },
      {
        type: "paragraph",
        text: "None of this is difficult. The failure mode is that everything works in dev because dev serves from the root, and then you discover the problem when someone sends you a link that shows nothing. Subpath hosting moves the question from where does this run to where does this get built, and every production 404 I have had on this site has been a URL that nobody rewrote.",
      },
    ],
  },
  {
    id: "content-model",
    title: "Markdown Was Never Going to Work Here",
    subtitle: "A type union with six members replaced a format I would have needed three dependencies to render.",
    date: "SEP 25, 2026",
    readTime: "5 MIN READ",
    category: "ARCHITECTURE",
    decision: {
      chose: "A six-member typed block union rendered by the site itself",
      over: "Markdown plus three dependencies to render it",
    },
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
    content: [
      {
        type: "paragraph",
        text: "The journal began as content: string[], with three placeholder entries that were one paragraph of text each. That was enough for placeholders. The first real article needed a code block with a language label and a caption underneath it, and a string cannot carry either.",
      },
      {
        type: "paragraph",
        text: "There were two directions: adopt a markup format and render it, or model the content. I spent a genuinely long time on the first one, because it is the default answer, and the default answer is usually right.",
      },
      { type: "heading", text: "The case I did not take" },
      {
        type: "paragraph",
        text: "Markdown gives you a standard, a syntax everyone already knows, an ecosystem of renderers, and the ability to paste prose in from anywhere. To render it with code blocks and list styling it wants react-markdown plus remark-gfm plus a syntax highlighter. That is three dependencies on a project where I had just finished removing six unused ones and measured the bundle for it. There is a real cost to that trade being invisible.",
      },
      {
        type: "paragraph",
        text: "Beyond the weight, a format is a negotiation. Theme files decide your margins, a rehype plugin decides whether raw HTML passes through, and the moment you want a block to look a specific way you are configuring a system rather than editing a component. The article stops owning its layout.",
      },
      { type: "heading", text: "What the union bought" },
      {
        type: "code",
        language: "ts",
        caption: "src/types.ts — the entire content model",
        code: `export type JournalBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'code'; language: string; code: string; caption?: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'quote'; text: string; attribution?: string }
  | { type: 'image'; src: string; alt: string; caption?: string };`,
      },
      {
        type: "list",
        items: [
          "Invalid content does not compile. A block called 'paragraphs', or a code block with no language, fails tsc before it reaches anyone.",
          "The renderer is one switch. Five shapes, five cases, no plugin ordering and no AST to learn.",
          "Structure is data, so it can be rendered by a React modal and by a build step that writes static HTML, from the same array.",
          "Layout lives next to markup: margins, borders and captions are in the component, not in a theme file two packages away.",
        ],
      },
      { type: "heading", text: "What it actually costs" },
      {
        type: "paragraph",
        text: "Authoring is verbose. Every paragraph is an object, every heading is an object, and an article with forty blocks is four hundred lines of data where Markdown would have been fifty lines of prose. I accepted that because I write five of these a month. If the posts became daily and multiple people wrote them, this model would start to lose.",
      },
      {
        type: "paragraph",
        text: "The more honest limitation: there is no inline formatting. You cannot bold a word inside a paragraph or drop a link mid-sentence without adding an inline block to the union. I left that out on purpose, because six block types cover everything published so far, and a format with an open vocabulary is exactly what starts by serving you and ends up owning you. When a post genuinely needs emphasis, the right move is to add the inline variant, not to import a full markup parser for one `<strong>`.",
      },
      { type: "heading", text: "Two renderers, and that is the tax" },
      {
        type: "paragraph",
        text: "The modal returns JSX; the generator that writes the static article pages returns HTML strings. So the switch exists twice, in two files, over the same union. The type system will stop an invalid block from being constructed in either one, and it will not stop you from adding a seventh block type in one renderer and forgetting the other. That discipline problem is the price of not using a markup language, and it is a smaller price than the dependency I avoided.",
      },
      {
        type: "code",
        language: "tsx",
        caption: "src/components/JournalModal.tsx — one case per block",
        code: `case 'code':
  return (
    <figure key={key}>
      <div className="rounded-2xl border border-white/10 bg-black/50">
        <span className="text-[10px] font-mono uppercase">
          {block.language}
        </span>
        <pre className="p-4 overflow-x-auto">
          <code>{block.code}</code>
        </pre>
      </div>
      {block.caption && <figcaption>{block.caption}</figcaption>}
    </figure>
  );`,
      },
      {
        type: "quote",
        text: "Pick a format when the vocabulary is open and the authors are many. Pick a type when the vocabulary is closed and you are the only one writing.",
      },
      { type: "heading", text: "The rule I ended up with" },
      {
        type: "paragraph",
        text: "Six block types, one author, a fixed set of things I want a technical article to contain. That is a closed vocabulary, and a closed vocabulary is what a sum type is for. The content model is forty lines of TypeScript and zero dependencies, and the article you are reading was rendered by a switch statement.",
      },
    ],
  },
  {
    id: "seasonal-theme",
    title: "A Seasonal Theme Without a Rewrite",
    subtitle: "Turning the whole site orange for October with two colours and one CSS filter, and reverting it in a single commit on the first of November.",
    date: "OCT 04, 2026",
    readTime: "4 MIN READ",
    category: "FRONTEND",
    decision: {
      chose: "A branch that swaps the accent ramp globally",
      over: "A themed component layer with a second design system",
    },
    image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=800&q=80",
    content: [
      {
        type: "paragraph",
        text: "Every seasonal redesign starts with the same temptation: build a theme system. Tokens, a provider, a second palette, a toggle. It is the correct answer for a product that ships themes to customers, and the wrong answer for a personal site that wants to be orange for four weeks a year.",
      },
      { type: "heading", text: "Two colours, not a design system" },
      {
        type: "paragraph",
        text: "The accent on this site is one short ramp: a light blue that fades into a darker one. It is written literally in the Tailwind classes, the gradients, the focus ring, the code-highlight theme and the static page generator, about a hundred and forty times in total. Swapping those two hex values recolours the buttons, links, rings, glows and gradients everywhere at once, because every one of them already pointed at the same pair.",
      },
      {
        type: "code",
        language: "css",
        caption: "src/index.css — the whole palette change, in one rule",
        code: `.accent-gradient {
  background: linear-gradient(90deg, #FF8C42 0%, #B23A0F 100%);
}`,
      },
      { type: "heading", text: "Recolour the footage, do not film new footage" },
      {
        type: "paragraph",
        text: "The hero plays ambient landscape clips and the footer plays a streamed one. Commissioning matching seasonal footage, licensing it and re-encoding it is a week of work for a background nobody looks at directly. One CSS filter does the same job: it pushes the existing clips toward ember, which is enough to change the mood without touching a single video file.",
      },
      {
        type: "code",
        language: "css",
        caption: "One class, applied to the background videos only",
        code: `.halloween-video {
  filter: sepia(0.5) hue-rotate(-15deg) saturate(1.4) brightness(0.8) contrast(1.1);
}`,
      },
      {
        type: "list",
        items: [
          "Changed: the accent ramp, the loading screen words, a filter on the background videos, a pumpkin favicon and this entry.",
          "Unchanged: the layout, the components, the data model, the build, and every piece of copy that is not seasonal.",
        ],
      },
      { type: "heading", text: "The revert is the whole point" },
      {
        type: "paragraph",
        text: "Because the work lives on one branch and touches only colours, copy, one class and one asset, undoing it is a revert, not an archaeology project. A seasonal theme that takes a week to remove is worse than no seasonal theme at all, and the calendar is the only thing that decides when this goes away.",
      },
      {
        type: "quote",
        text: "If you cannot undo a theme in one commit, you did not build a theme. You built a second site.",
      },
    ],
  },
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

/**
 * The one line of work in progress shown under the hero. This is the only field
 * on the site that is expected to change often, which is the point: it answers
 * "is any of this still alive?" without writing a post.
 *
 * Set the whole thing to null to hide the strip.
 */
export const currentlyBuildingData: CurrentlyBuilding = {
  name: 'KashhCMD Portfolio',
  description:
    'A seasonal Halloween recolour ships this month; the whole palette swaps back on the first of November.',
  status: 'In progress',
};

/**
 * A short changelog shown next to the current work. Keep it to the handful of
 * changes worth a stranger's attention, newest first, and keep the dates real.
 */
export const recentWorkData: RecentWork[] = [
  {
    date: 'Oct 2026',
    title: 'Seasonal Halloween theme',
    kind: 'Feature',
  },
  {
    date: 'Sep 2026',
    title: 'Architecture diagrams on project pages',
    kind: 'Feature',
  },
  {
    date: 'Sep 2026',
    title: 'Search results ranked by relevance',
    kind: 'Feature',
  },
  {
    date: 'Sep 2026',
    title: 'Live-demo badges only when a demo exists',
    kind: 'Fix',
  },
  {
    date: 'Sep 2026',
    title: 'Decision log for every journal entry',
    kind: 'Content',
  },
];
