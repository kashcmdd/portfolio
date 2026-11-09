/**
 * Generate the project covers that are drawn from a project's own architecture.
 *
 * Three projects have no screenshot to show: ScriptForge, the music bot and
 * Nebula. Their cards used a branded letter tile, which said nothing about the
 * work. Every one of those projects already carries a layered `architecture`
 * model (the same data the case-study diagram renders), so the cover is built
 * from that instead — real layers, real component names, no invented detail.
 *
 * Like the Open Graph cards, these are committed assets rather than a build
 * step: a social preview changes far less often than the site, and Chromium is
 * not guaranteed on every machine that runs `npm run build`. Regenerate with:
 *
 *   npm run assets:covers
 *
 * Requires Playwright's Chromium (`npx playwright install chromium`).
 *
 * The list below is explicit rather than "every project with architecture":
 * Melon has a real screenshot and should keep it. A project added without a
 * screenshot needs its id here and an `image` pointing at the file this writes.
 *
 * Layout note: the canvas is 1600x900, but the same file is rendered into cards
 * at 16/10 and 4/3 with `object-cover`, and into a 1200x630 social card. All of
 * those crop around the centre, so the diagram sits inside a centred 1120-wide
 * column and its height stays under 780px. Anything outside that box is
 * background, never content.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const COVER_PROJECTS = ['scriptforge', 'discord-music-bot', 'nebula'];

const esc = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const fontData = async (file) =>
  `data:font/woff2;base64,${(await readFile(path.join(publicDir, 'fonts', file))).toString('base64')}`;

const inter = await fontData('inter-normal-latin.woff2');
const mono = await fontData('jetbrains-mono-latin.woff2');

const coverHtml = (project) => {
  const { architecture } = project;
  const rows = architecture.layers
    .map((layer, index) => {
      const nodes = architecture.nodes.filter((node) => node.layer === index);
      const chips = nodes
        .map(
          (node) =>
            `<div class="node"><div class="n">${esc(node.label)}</div>${
              node.detail ? `<div class="d">${esc(node.detail)}</div>` : ''
            }</div>`
        )
        .join('');
      return `<div class="layer">
        <div class="layer-label">
          <span class="layer-index">${String(index + 1).padStart(2, '0')}</span>
          <span class="layer-title">${esc(layer.title)}</span>
        </div>
        <div class="nodes">${chips}</div>
      </div>`;
    })
    .join('');

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><style>
  @font-face { font-family: Inter; font-weight: 400; src: url(${inter}) format('woff2'); }
  @font-face { font-family: Mono; font-weight: 400; src: url(${mono}) format('woff2'); }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 1600px; height: 900px; overflow: hidden; background: #0a0a0a; }
  body { font-family: Inter, sans-serif; color: #fff; }
  .card {
    position: relative;
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    background:
      radial-gradient(44% 62% at 88% 2%, rgba(137, 170, 204, .22), transparent 62%),
      radial-gradient(38% 52% at 2% 100%, rgba(78, 133, 191, .15), transparent 66%),
      #0a0a0a;
  }
  /* A faint grid keeps the empty right-hand side from reading as a missing
     image, and stops the layer rows from floating in a void. */
  .grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, .035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, .035) 1px, transparent 1px);
    background-size: 80px 80px;
    -webkit-mask-image: radial-gradient(72% 82% at 50% 50%, #000 20%, transparent 88%);
    mask-image: radial-gradient(72% 82% at 50% 50%, #000 20%, transparent 88%);
  }
  .sheet { position: relative; width: 1120px; }
  .head {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 32px;
    padding-bottom: 18px;
    margin-bottom: 2px;
    border-bottom: 1px solid rgba(255, 255, 255, .12);
  }
  .kicker { font-family: Mono, monospace; font-size: 15px; letter-spacing: .34em; text-transform: uppercase; color: #89AACC; }
  .cat { font-family: Mono, monospace; font-size: 14px; letter-spacing: .16em; text-transform: uppercase; color: #767676; }
  .layer {
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 26px;
    align-items: center;
    padding: 17px 0;
    border-bottom: 1px solid rgba(255, 255, 255, .05);
  }
  .layer:last-child { border-bottom: 0; }
  .layer-label { display: flex; align-items: baseline; gap: 14px; font-family: Mono, monospace; }
  .layer-index { font-size: 14px; color: #4d4d4d; }
  .layer-title { font-size: 16px; letter-spacing: .1em; text-transform: uppercase; color: #9d9d9d; }
  .nodes { display: flex; flex-wrap: wrap; gap: 12px; }
  .node {
    border: 1px solid rgba(137, 170, 204, .24);
    background: linear-gradient(180deg, rgba(137, 170, 204, .09), rgba(137, 170, 204, .04));
    border-radius: 12px;
    padding: 12px 18px;
  }
  .node .n { font-size: 25px; line-height: 1.15; color: #ececec; }
  .node .d { margin-top: 4px; font-family: Mono, monospace; font-size: 14px; color: #8090a0; }
  .foot {
    margin-top: 22px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, .08);
    display: flex; justify-content: space-between;
    font-family: Mono, monospace; font-size: 13px; letter-spacing: .14em; text-transform: uppercase; color: #5d5d5d;
  }
</style></head>
<body><div class="card">
  <div class="grid"></div>
  <div class="sheet">
    <div class="head">
      <span class="kicker">System map</span>
      <span class="cat">${esc(project.category)}</span>
    </div>
    <div class="layers">${rows}</div>
    <div class="foot">
      <span>kashcmdd.github.io/portfolio</span>
      <span>${architecture.layers.length} layers &middot; ${architecture.nodes.length} components</span>
    </div>
  </div>
</div></body></html>`;
};

const server = await createServer({
  root,
  configFile: path.join(root, 'vite.config.ts'),
  server: { middlewareMode: true, hmr: false, watch: null },
  optimizeDeps: { noDiscovery: true, include: [] },
  appType: 'custom',
  logLevel: 'error',
});

try {
  const data = await server.ssrLoadModule('/src/data/portfolioData.ts');
  const projects = (data.projectsData ?? []).filter((project) =>
    COVER_PROJECTS.includes(project.id)
  );
  if (projects.length !== COVER_PROJECTS.length) {
    throw new Error(`expected ${COVER_PROJECTS.length} cover projects, found ${projects.length}`);
  }
  for (const project of projects) {
    if (!project.architecture) throw new Error(`${project.id} has no architecture data`);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
  for (const project of projects) {
    await page.setContent(coverHtml(project), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const file = path.join(publicDir, `${project.id}-cover.jpg`);
    await page.screenshot({ path: file, type: 'jpeg', quality: 86 });
    console.log(`  ${path.relative(root, file)}  (${project.architecture.layers.length} layers)`);
  }
  await browser.close();
  console.log(`Generated ${projects.length} architecture covers.`);
} finally {
  await server.close();
}
