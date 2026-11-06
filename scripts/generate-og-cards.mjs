/**
 * Generate the Open Graph cards.
 *
 * The cards are committed assets rather than a build step, because a social
 * preview changes far less often than the site and a browser is not guaranteed
 * on every machine that runs `npm run build`. Regenerate them with:
 *
 *   npm run assets:og
 *
 * Requires Playwright's Chromium (`npx playwright install chromium`).
 *
 * The text is rendered as real text, not baked into an image by a design tool,
 * which is what keeps the middle dots in the tech row from turning into the
 * `Â·` mojibake the previous hand-made card shipped with.
 */
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const projectDir = path.join(publicDir, 'og', 'projects');

// Mirrors the projects in src/data/portfolioData.ts. Kept here rather than
// imported because the data file is TypeScript and this script runs in plain
// Node; check-static-output fails if a card is missing, so a new project cannot
// quietly ship without one.
const PROJECTS = [
  {
    id: 'rainbow-leaderboard',
    title: 'Rainbow Leaderboard',
    category: 'Competitive Ladder Platform',
    subtitle: 'ELO-ranked Rainbow Six Siege ladder with tournaments, seasons and Discord auth.',
    image: 'rainbow-leaderboard.webp',
    tags: ['Python 3.12', 'FastAPI', 'PostgreSQL', 'Discord OAuth2'],
  },
  {
    id: 'scriptforge',
    title: 'ScriptForge',
    category: 'Full-Stack Web App',
    subtitle: 'Controller-script hub with conflict-safe versions and self-serve accounts.',
    image: 'scriptforge-placeholder.svg',
    tags: ['Next.js', 'React', 'TypeScript', 'SQLite'],
  },
  {
    id: 'discord-music-bot',
    title: 'Discord Music Bot',
    category: 'Discord Bot Development',
    subtitle: 'Three streaming sources, a Lavalink pipeline and a web dashboard.',
    image: 'discord-music-bot-placeholder.svg',
    tags: ['Node.js', 'Discord.js', 'Lavalink', 'Docker'],
  },
  {
    id: 'melon',
    title: 'Melon',
    category: 'Discord Moderation',
    subtitle: 'A maintained fork of an all-in-one moderation and community bot.',
    image: 'melon.webp',
    tags: ['Discord.js', 'Node.js', 'PostgreSQL', 'Sequelize'],
  },
  {
    id: 'kashhcmd-portfolio',
    title: 'KashhCMD Portfolio',
    category: 'Web Design & Frontend',
    subtitle: 'This site: liquid glass, static generation and a small first-paint budget.',
    image: 'portfolio-site.webp',
    tags: ['React 19', 'Vite', 'TypeScript', 'Tailwind CSS v4'],
  },
  {
    id: 'nebula',
    title: 'Nebula',
    category: 'Self-Hosted Bot Platform',
    subtitle: 'An AI-operable Discord bot on a reproducible Red-DiscordBot deployment.',
    image: 'nebula-placeholder.svg',
    tags: ['Python', 'Red-DiscordBot', 'DeepSeek', 'Tool Calling'],
  },
];

const fontData = async (file) =>
  `data:font/woff2;base64,${(await readFile(path.join(publicDir, 'fonts', file))).toString('base64')}`;

const imageData = async (file) => {
  const extension = path.extname(file).slice(1).toLowerCase();
  const mime =
    extension === 'svg'
      ? 'image/svg+xml'
      : extension === 'webp'
        ? 'image/webp'
        : extension === 'png'
          ? 'image/png'
          : 'image/jpeg';
  return `data:${mime};base64,${(await readFile(path.join(publicDir, file))).toString('base64')}`;
};

const inter = await fontData('inter-normal-latin.woff2');
const serif = await fontData('instrument-serif-italic-latin.woff2');

const BASE_CSS = `
  @font-face { font-family: Inter; font-weight: 400; src: url(${inter}) format('woff2'); }
  @font-face { font-family: Serif; font-style: italic; font-weight: 400; src: url(${serif}) format('woff2'); }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 1200px; height: 630px; overflow: hidden; background: #0a0a0a; }
  body { font-family: Inter, sans-serif; color: #fff; }
  .card { position: relative; width: 100%; height: 100%; padding: 68px; display: flex; flex-direction: column; justify-content: center; background:
    radial-gradient(58% 80% at 88% 12%, rgba(137, 170, 204, 0.22), transparent 62%),
    radial-gradient(52% 62% at 6% 96%, rgba(78, 133, 191, 0.18), transparent 62%),
    #0a0a0a; }
  .kicker { font-size: 15px; letter-spacing: 0.38em; text-transform: uppercase; color: #89AACC; }
  h1 { font-family: Serif, serif; font-style: italic; font-weight: 400; line-height: 0.95; letter-spacing: -0.03em; }
  .rule { width: 76px; height: 4px; border-radius: 999px; margin: 26px 0; background: linear-gradient(90deg, #89AACC, #4E85BF); }
  .tag { font-size: 30px; color: #e5e5e5; }
  .stack { margin-top: 18px; font-size: 21px; color: #8a8a8a; }
  .foot { position: absolute; left: 68px; right: 68px; bottom: 44px; display: flex; justify-content: space-between; gap: 24px; border-top: 1px solid rgba(255, 255, 255, 0.12); padding-top: 20px; font-size: 17px; color: #737373; }
`;

const siteCard = () => `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><style>${BASE_CSS}
  h1 { font-size: 132px; }
</style></head>
<body><div class="card">
  <div class="kicker">Portfolio &rsquo;26</div>
  <h1>KashhCMD</h1>
  <div class="rule"></div>
  <p class="tag">Discord bots &amp; web apps, built end to end.</p>
  <p class="stack">discord.js &middot; React &middot; TypeScript &middot; Node.js &middot; PostgreSQL</p>
  <div class="foot">
    <span>kashcmdd.github.io/portfolio</span>
    <span>Nebula &middot; Rainbow Leaderboard &middot; Melon</span>
  </div>
</div></body></html>`;

const projectCard = (project, image) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><style>${BASE_CSS}
  .bg { position: absolute; inset: 0; background: center / cover no-repeat url(${image}); opacity: 0.3; filter: saturate(0.85); }
  .shade { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(10, 10, 10, 0.98) 0%, rgba(10, 10, 10, 0.9) 46%, rgba(10, 10, 10, 0.45) 100%); }
  .card { background: transparent; }
  .content { position: relative; }
  h1 { font-size: 104px; max-width: 760px; }
  .tag { max-width: 760px; line-height: 1.35; }
</style></head>
<body><div class="card">
  <div class="bg"></div>
  <div class="shade"></div>
  <div class="content">
    <div class="kicker">${project.category}</div>
    <h1>${project.title}</h1>
    <div class="rule"></div>
    <p class="tag">${project.subtitle}</p>
    <p class="stack">${project.tags.join(' &middot; ')}</p>
  </div>
  <div class="foot">
    <span>kashcmdd.github.io/portfolio</span>
    <span>Case study</span>
  </div>
</div></body></html>`;

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

const shoot = async (html, file) => {
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: file, type: 'jpeg', quality: 92 });
  console.log(`  ${path.relative(root, file)}`);
};

await shoot(siteCard(), path.join(publicDir, 'og-image.jpg'));

await mkdir(projectDir, { recursive: true });
for (const project of PROJECTS) {
  await shoot(
    projectCard(project, await imageData(project.image)),
    path.join(projectDir, `${project.id}.jpg`)
  );
}

await browser.close();
console.log(`Generated ${PROJECTS.length + 1} Open Graph cards.`);
