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
    image: "/portfolio/portfolio-site.jpg",
    tags: ["React 19", "Vite", "TypeScript", "Tailwind CSS v4", "GSAP", "GitHub Pages"],
    githubUrl: "https://github.com/kashcmdd/portfolio",
    liveUrl: "https://kashcmdd.github.io/portfolio/",
    featured: true,
    colSpanDesktop: 7,
    aspectRatio: "aspect-[16/10]",
    highlights: [
      "Liquid glass design tokens in Tailwind v4, composed over a responsive 12-column bento grid",
      "HLS video backgrounds gated by IntersectionObserver, with the 594 kB parser lazy-loaded and skipped entirely on native-HLS browsers",
      "Push-to-deploy Pages workflow with vendor code-splitting holding initial JS to 470 kB",
    ],
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
    id: "elo-decay",
    title: "Your Ladder Needs to Forget",
    subtitle: "Rating decay is the least interesting part of a ranked system to build, and the easiest thing to get wrong.",
    date: "SEP 18, 2026",
    readTime: "7 MIN READ",
    category: "ALGORITHMS",
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
    title: "Cutting 56% Off My Portfolio's JavaScript",
    subtitle: "One static import was costing more than React, the router and every icon combined.",
    date: "SEP 25, 2026",
    readTime: "6 MIN READ",
    category: "PERFORMANCE",
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
<link rel="modulepreload" href="/portfolio/assets/icons-SHsSCZuo.js">
<link rel="modulepreload" href="/portfolio/assets/gsap-CzGW6FVa.js">
<!-- no hls -->`,
      },
      {
        type: "quote",
        text: "Initial JavaScript went from 1,076 kB to 470 kB. The hls chunk is still 581 kB, it just is not your problem until you scroll to it.",
      },
    ],
  },
  {
    id: "sqlite-postgres",
    title: "SQLite Is Fine Until It Isn't",
    subtitle: "Two of my projects use the same data, in two completely different databases, for two completely different reasons.",
    date: "SEP 08, 2026",
    readTime: "5 MIN READ",
    category: "ARCHITECTURE",
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
