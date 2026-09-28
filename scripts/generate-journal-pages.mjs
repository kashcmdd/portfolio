/**
 * Writes a real, static HTML page for every journal entry.
 *
 * The SPA can show a post to a human but not to a link previewer: crawlers
 * never execute JavaScript, so every shared hash URL returns the site-level
 * metadata from index.html. These pages are the canonical shareable URLs —
 * each one carries its own title, description, image and fully rendered body,
 * works with JavaScript disabled, and returns a real 200 from a static host
 * with no rewrite rules.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { esc, toIso, renderBlocks, articleOutline, requireBase } from './lib/journal-blocks.mjs';
import { PRISM_TOKEN_CSS } from './lib/prism.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE_ORIGIN = 'https://kashcmdd.github.io';

// Unsplash URLs arrive at w=800; social cards want 1200x630.
const socialImage = (image) => (image || '').replace('w=800', 'w=1200&h=630');

// The article pages live at /journal/<id>/ and the index at /journal/, so each
// needs a different prefix to reach the site root where fonts and icons live.
const cssFor = (prefix) => `
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 300 700;
    font-display: swap;
    src: url('${prefix}fonts/inter-normal-latin.woff2') format('woff2');
  }
  @font-face {
    font-family: 'Instrument Serif';
    font-style: italic;
    font-weight: 400;
    font-display: swap;
    src: url('${prefix}fonts/instrument-serif-italic-latin.woff2') format('woff2');
  }
  body {
    margin: 0;
    background: #0a0a0a;
    color: #f5f5f5;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    font-weight: 300;
    line-height: 1.75;
    -webkit-font-smoothing: antialiased;
  }
  a { color: #89aacc; }
  .top {
    max-width: 760px;
    margin: 0 auto;
    padding: 26px 24px 0;
    font-size: .82rem;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: #8a8a8a;
  }
  .top a { color: #89aacc; text-decoration: none; }
  main { max-width: 760px; margin: 0 auto; padding: 46px 24px 96px; }
  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    font-size: 11px;
    letter-spacing: .16em;
    text-transform: uppercase;
    color: #8a8a8a;
    margin-bottom: 20px;
  }
  .meta .cat { color: #89aacc; font-weight: 600; }
  h1 {
    font-family: 'Instrument Serif', Georgia, serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(2.3rem, 6vw, 3.4rem);
    line-height: 1.04;
    letter-spacing: -.01em;
    margin: 0 0 14px;
  }
  .sub {
    font-size: 1.04rem;
    color: #c4c4c4;
    font-style: italic;
    margin: 0 0 28px;
    padding-bottom: 26px;
    border-bottom: 1px solid rgba(255, 255, 255, .1);
  }
  .banner {
    display: block;
    width: 100%;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, .1);
    margin-bottom: 36px;
  }
  h2 {
    font-size: 1.3rem;
    font-weight: 600;
    letter-spacing: -.01em;
    line-height: 1.35;
    margin: 46px 0 12px;
    color: #fff;
  }
  p { margin: 0 0 18px; color: #d4d4d4; font-size: 1.02rem; }
  ul, ol { margin: 0 0 20px; padding-left: 22px; color: #d4d4d4; }
  li { margin-bottom: 9px; }
  li::marker { color: #89aacc; }
  blockquote {
    margin: 28px 0;
    padding-left: 18px;
    border-left: 2px solid rgba(137, 170, 204, .6);
    font-style: italic;
    color: #cfcfcf;
  }
  blockquote p:last-of-type { margin-bottom: 0; }
  blockquote footer {
    margin-top: 8px;
    font-style: normal;
    font-size: .78rem;
    color: #8a8a8a;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }
  figure.code {
    margin: 28px 0;
    border: 1px solid rgba(255, 255, 255, .1);
    border-radius: 16px;
    overflow: hidden;
    background: rgba(0, 0, 0, .5);
  }
  .toc { margin: 32px 0; }
  .toc details {
    border: 1px solid rgba(255, 255, 255, .1);
    border-radius: 14px;
    background: rgba(255, 255, 255, .02);
  }
  .toc summary {
    padding: 12px 18px;
    cursor: pointer;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11px;
    letter-spacing: .16em;
    text-transform: uppercase;
    color: #8a8a8a;
    list-style: none;
  }
  .toc summary::-webkit-details-marker { display: none; }
  .toc summary::after { content: '+'; float: right; color: #89AACC; }
  .toc details[open] summary::after { content: '\u2013'; }
  .toc summary:hover { color: #fff; }
  .toc summary:focus-visible { outline: 2px solid #89AACC; outline-offset: -2px; }
  .toc ol {
    margin: 0;
    padding: 0 18px 16px 34px;
    counter-reset: toc;
    list-style: none;
  }
  .toc li { margin: 6px 0; }
  .toc a { color: #b4b4b4; text-decoration: none; font-size: 14px; }
  .toc a:hover { color: #fff; }
  /* Anchored headings must clear the sticky top bar, or #link jumps the
     heading underneath it. */
  article h2 { scroll-margin-top: 72px; }
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 0 0 28px;
    padding: 0;
    list-style: none;
  }
  .tags li {
    margin: 0;
    padding: 4px 11px;
    border: 1px solid rgba(255, 255, 255, .1);
    border-radius: 999px;
    background: rgba(255, 255, 255, .03);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11px;
    color: #b4b4b4;
  }
  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin: 0 0 34px;
  }
  .links a {
    display: inline-block;
    padding: 9px 18px;
    border: 1px solid rgba(255, 255, 255, .12);
    border-radius: 999px;
    background: rgba(255, 255, 255, .03);
    color: #f5f5f5;
    font-size: 13px;
    text-decoration: none;
    transition: background .15s, border-color .15s;
  }
  .links a:hover { background: rgba(255, 255, 255, .09); border-color: rgba(255, 255, 255, .28); }
  .links a:focus-visible { outline: 2px solid #89AACC; outline-offset: 2px; }
  .codebar {
    padding: 8px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, .1);
    background: rgba(255, 255, 255, .02);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 10px;
    letter-spacing: .18em;
    text-transform: uppercase;
    color: #8a8a8a;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .codebar .copy {
    font: inherit;
    letter-spacing: .12em;
    color: #8a8a8a;
    background: rgba(255, 255, 255, .04);
    border: 1px solid rgba(255, 255, 255, .1);
    border-radius: 999px;
    padding: 4px 10px;
    cursor: pointer;
    transition: color .15s, background .15s;
  }
  .codebar .copy:hover { color: #fff; background: rgba(255, 255, 255, .1); }
  .codebar .copy:focus-visible { outline: 2px solid #89AACC; outline-offset: 2px; }
  .codebar .copy[data-copied] { color: #9ece6a; border-color: rgba(158, 206, 106, .4); }
  figure.code pre { margin: 0; padding: 16px; overflow-x: auto; }
  figure.code code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 13px;
    line-height: 1.65;
    color: #e5e5e5;
    white-space: pre;
  }
  figure.code figcaption {
    padding: 0 16px 13px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11px;
    color: #8a8a8a;
  }
  figure.shot img {
    display: block;
    width: 100%;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, .1);
  }
  figure.shot figcaption {
    margin-top: 8px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11px;
    color: #8a8a8a;
  }
  .more { margin-top: 70px; border-top: 1px solid rgba(255, 255, 255, .1); padding-top: 30px; }
  .more h3 {
    margin: 0 0 6px;
    font-size: .7rem;
    font-weight: 500;
    letter-spacing: .28em;
    text-transform: uppercase;
    color: #8a8a8a;
  }
  .more a {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 20px;
    padding: 16px 0;
    border-bottom: 1px solid rgba(255, 255, 255, .06);
    color: #f5f5f5;
    text-decoration: none;
  }
  .more a:hover { color: #89aacc; }
  .more a span { color: #8a8a8a; font-size: .8rem; white-space: nowrap; }
  .end { max-width: 760px; margin: 0 auto; padding: 0 24px 60px; color: #6a6a6a; font-size: .82rem; }
  .end a { color: #8a8a8a; }
  .comments-section { margin-top: 60px; padding-top: 40px; border-top: 1px solid rgba(255, 255, 255, .1); }
  .comments-section h3 { margin: 0 0 8px; font-size: 1.1rem; color: #fff; }
  .comments-notice { margin: 0; font-size: .82rem; color: #8a8a8a; font-style: italic; }
  @media (max-width: 640px) {
    .more a { flex-direction: column; gap: 4px; }
  }
`;

const head = ({ title, description, canonical, image, imageAlt, prefix, type = 'article' }) => `
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)} — KashhCMD</title>
    <meta name="description" content="${esc(description)}" />
    <meta name="robots" content="noindex, nofollow" />
    <meta name="author" content="KashhCMD" />
    <meta name="color-scheme" content="dark" />
    <meta name="theme-color" content="#0a0a0a" />
    <link rel="canonical" href="${canonical}" />
    <link rel="icon" type="image/svg+xml" href="${prefix}favicon.svg" />
    <link rel="apple-touch-icon" href="${prefix}apple-touch-icon.png" />
    <meta property="og:type" content="${type}" />
    <meta property="og:site_name" content="KashhCMD (Dev)" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:image" content="${esc(image)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(imageAlt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${esc(image)}" />
    <meta name="twitter:image:alt" content="${esc(imageAlt)}" />
    <link rel="preload" href="${prefix}fonts/inter-normal-latin.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="${prefix}fonts/instrument-serif-italic-latin.woff2" as="font" type="font/woff2" crossorigin />`;

const jsonLd = (entry, canonical, published) =>
  JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: entry.title,
    description: entry.subtitle,
    ...(published ? { datePublished: published } : {}),
    image: socialImage(entry.image),
    url: canonical,
    author: { '@type': 'Person', name: 'KashhCMD' },
    publisher: { '@type': 'Person', name: 'KashhCMD' },
  }).replace(/</g, '\\u003c');

function projectsIndexPage(all, base) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Projects - KashhCMD</title>
    <meta name="description" content="Selected work: web apps, Discord bots and frontend experiments by KashhCMD." />
    <meta name="robots" content="noindex, nofollow" />
    <link rel="canonical" href="${SITE_ORIGIN}${base}projects/" />
    <style>${cssFor('../')}</style>
  </head>
  <body>
    <div class="top"><a href="../">KashhCMD</a> / Projects</div>
    <main>
      <h1>Projects</h1>
      <p class="sub">Web apps, Discord bots and frontend work. Each one has its own page.</p>
      <nav class="more">
        ${all
          .map(
            (p) =>
              `<a href="./${esc(p.id)}/"><img src="${esc(p.image)}" alt="${esc(p.title)}" /><strong>${esc(p.title)}</strong><span>${esc(p.category)}</span></a>`
          )
          .join('\n        ')}
      </nav>
    </main>
    <div class="end">
      <a href="../">← Back to the portfolio</a>
      A · Plain HTML. No JavaScript, no server.
    </div>
  </body>
</html>
`;
}

const projectJsonLd = (project, canonical) =>
  JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.subtitle,
    image: socialImage(project.image),
    url: canonical,
    author: { '@type': 'Person', name: 'KashhCMD' },
    keywords: (project.tags || []).join(', '),
  }).replace(/</g, '\\u003c');

// The project pages exist because a portfolio that only describes work inside a
// modal is not linkable, not quotable and not readable by anything that is not a
// browser. Same reasoning as the article pages: one URL per project, plain HTML,
// no JavaScript, so a recruiter can paste a link and it just works.
function projectPage(project, base, all) {
  const canonical = `${SITE_ORIGIN}${base}projects/${project.id}/`;
  const others = all.filter((p) => p.id !== project.id);
  const highlights = project.highlights || [
    'Asynchronous event loops & high-speed REST endpoints',
    'Zero-downtime containerized deployments & state persistence',
    'Responsive, fluid UI with liquid glass visual tokens',
  ];

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(project.title)} - KashhCMD</title>
    <meta name="description" content="${esc(project.subtitle)}" />
    <meta name="robots" content="noindex, nofollow" />
    <link rel="canonical" href="${esc(canonical)}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${esc(project.title)}" />
    <meta property="og:description" content="${esc(project.subtitle)}" />
    <meta property="og:url" content="${esc(canonical)}" />
    <meta property="og:image" content="${socialImage(project.image)}" />
    <style>${cssFor('../../')}</style>
    <script type="application/ld+json">${projectJsonLd(project, canonical)}</script>
  </head>
  <body>
    <div class="top"><a href="../../">KashhCMD</a> / Projects</div>
    <main>
      <article>
        <div class="meta">
          <span class="cat">${esc(project.category)}</span>
        </div>
        <h1>${esc(project.title)}</h1>
        <p class="sub">${esc(project.subtitle)}</p>
        <img class="banner" src="${esc(project.image)}" alt="${esc(project.title)}" />
        <p>${esc(project.description)}</p>

        <h2>What it does</h2>
        <ul>
          ${highlights.map((h) => `<li>${esc(h)}</li>`).join('\n          ')}
        </ul>

        ${
          project.tags?.length
            ? `<h2>Built with</h2>
        <ul class="tags">
          ${project.tags.map((t) => `<li>${esc(t)}</li>`).join('\n          ')}
        </ul>`
            : ''
        }

        ${
          project.githubUrl || project.liveUrl
            ? `<div class="links">
          ${project.githubUrl ? `<a href="${esc(project.githubUrl)}" rel="noopener noreferrer">Source code</a>` : ''}
          ${project.liveUrl ? `<a href="${esc(project.liveUrl)}" rel="noopener noreferrer">Live site</a>` : ''}
        </div>`
            : ''
        }
      </article>

      ${
        others.length
          ? `<nav class="more">
        <h3>More projects</h3>
        ${others
          .map((p) => `<a href="../${p.id}/">${esc(p.title)}<span>${esc(p.category)}</span></a>`)
          .join('\n        ')}
      </nav>`
          : ''
      }
    </main>
    <div class="end">
      <a href="../../">← Back to the portfolio</a>
      A · Every project page is static: no JavaScript, no server.
    </div>
  </body>
</html>
`;
}

function articlePage(entry, base, all) {
  const canonical = `${SITE_ORIGIN}${base}journal/${entry.id}/`;
  const published = toIso(entry.date);
  const others = all.filter((e) => e.id !== entry.id);
  const outline = articleOutline(entry.content);

  return `<!doctype html>
<html lang="en">
  <head>${head({
    title: entry.title,
    description: entry.subtitle,
    canonical,
    image: socialImage(entry.image),
    imageAlt: entry.title,
    prefix: '../../',
  })}
    <style>${cssFor('../../')}</style>
    <style>${PRISM_TOKEN_CSS}</style>
    <script type="application/ld+json">${jsonLd(entry, canonical, published)}</script>
  </head>
  <body>
    <div class="top"><a href="../../">KashhCMD</a> / Journal</div>
    <main>
      <article>
        <div class="meta">
          <span class="cat">${esc(entry.category)}</span>
          <span>${esc(entry.date)}</span>
          <span>${esc(entry.readTime)}</span>
        </div>
        <h1>${esc(entry.title)}</h1>
        <p class="sub">${esc(entry.subtitle)}</p>
        <img class="banner" src="${esc(entry.image)}" alt="${esc(entry.title)}" />
        ${
          outline.length >= 3
            ? `<nav class="toc" aria-label="Contents">
        <details>
          <summary>Contents</summary>
          <ol>
            ${outline.map((h) => `<li><a href="#${esc(h.id)}">${esc(h.text)}</a></li>`).join('\n            ')}
          </ol>
        </details>
      </nav>`
            : ''
        }
        ${renderBlocks(entry.content, { headingLevel: 2, rich: true }).join('\n        ')}
      </article>
      
      <div class="comments-section">
        <h3>Discussion</h3>
        <p class="comments-notice">This is a static page, so it carries no comment form. Discussion lives in the app, where it is stored locally in your browser and never sent anywhere.</p>
      </div>
      ${
        others.length
          ? `<nav class="more">
        <h3>More from the journal</h3>
        ${others
          .map(
            (e) =>
              `<a href="../${e.id}/">${esc(e.title)}<span>${esc(e.date)}</span></a>`
          )
          .join('\n        ')}
      </nav>`
          : ''
      }
    </main>
    <div class="end">
      <a href="../../">← Back to the portfolio</a>
      A · All articles are static pages: no JavaScript, no server.
    </div>
    <script>
      // One delegated listener for every copy button on the page. The code to
      // copy is read back out of the highlighted <code> element rather than
      // embedded separately, so there is no second copy of the source to keep
      // in sync and no raw text to escape into a data attribute.
      (function () {
        var reset;
        document.addEventListener('click', function (event) {
          var button = event.target.closest('[data-copy]');
          if (!button) return;
          var code = button.closest('figure.code') && button.closest('figure.code').querySelector('code');
          if (!code || !navigator.clipboard) return;
          navigator.clipboard.writeText(code.textContent || '').then(
            function () {
              button.textContent = 'Copied';
              button.setAttribute('data-copied', '');
              clearTimeout(reset);
              reset = setTimeout(function () {
                button.textContent = 'Copy';
                button.removeAttribute('data-copied');
              }, 1600);
            },
            function () {
              button.textContent = 'Press Ctrl+C';
            }
          );
        });
      })();
    </script>
  </body>
</html>
`;
}

function indexPage(all, base) {
  const canonical = `${SITE_ORIGIN}${base}journal/`;
  return `<!doctype html>
<html lang="en">
  <head>${head({
    title: 'Journal',
    description:
      'Technical writing on algorithms, performance and architecture by KashhCMD — Discord bots and web apps, built end to end.',
    canonical,
    image: `${SITE_ORIGIN}${base}og-image.jpg`,
    imageAlt: 'KashhCMD — Discord bots and web apps, built end to end.',
    prefix: '../',
    type: 'website',
  })}
    <style>${cssFor('../')}</style>
  </head>
  <body>
    <div class="top"><a href="../">KashhCMD</a> / Journal</div>
    <main>
      <h1>Journal</h1>
      <p class="sub">Articles on algorithms, performance and architecture — written from code that ships.</p>
      <nav class="more">
        ${all
          .map(
            (e) =>
              `<a href="./${e.id}/">${esc(e.title)}<span>${esc(e.date)} · ${esc(e.readTime)}</span></a>`
          )
          .join('\n        ')}
      </nav>
    </main>
    <div class="end"><a href="../">← Back to the portfolio</a></div>
  </body>
</html>
`;
}

// Written here rather than kept as a static file in public/ so the URLs cannot
// drift from `base` or from the list of entries above.
function sitemapXml(base, entries, projects = []) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE_ORIGIN}${base}`, lastmod: today, priority: '1.0' },
    { loc: `${SITE_ORIGIN}${base}journal/`, lastmod: today, priority: '0.8' },
    ...entries.map((entry) => ({
      loc: `${SITE_ORIGIN}${base}journal/${entry.id}/`,
      lastmod: toIso(entry.date) || today,
      priority: '0.7',
    })),
    { loc: `${SITE_ORIGIN}${base}projects/`, lastmod: today, priority: '0.8' },
    ...projects.map((project) => ({
      loc: `${SITE_ORIGIN}${base}projects/${project.id}/`,
      lastmod: today,
      priority: '0.7',
    })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${esc(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;
}

// This build is noindex (see index.html and the per-page robots meta), so
// robots.txt is a second line of defence rather than a crawl invitation.
// Pointing crawlers at a sitemap here would contradict both. Kept ASCII so the
// file reads the same in every tool that touches it.
const robotsTxt = () => `# Development build - not for indexing.
# Mirrors the noindex, nofollow meta in index.html and on every generated page.
User-agent: *
Disallow: /
`;

const server = await createServer({
  root,
  configFile: path.join(root, 'vite.config.ts'),
  server: { middlewareMode: true, hmr: false, watch: null },
  // Only a static data module is loaded, so there is nothing to pre-bundle.
  // Discovering deps spawns a scanner whose abort during close() logs errors.
  optimizeDeps: { noDiscovery: true, include: [] },
  appType: 'custom',
  logLevel: 'error',
});

try {
  const { journalEntriesData, projectsData } = await server.ssrLoadModule(
    '/src/data/portfolioData.ts'
  );
  const base = requireBase(server.config, 'generate-journal-pages');
  const dist = path.join(root, 'dist');

  if (!journalEntriesData?.length) throw new Error('no journal entries loaded');

  for (const entry of journalEntriesData) {
    const dir = path.join(dist, 'journal', entry.id);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), articlePage(entry, base, journalEntriesData));
    console.log(`  journal/${entry.id}/  ${entry.title}`);
  }

  if (projectsData?.length) {
    for (const project of projectsData) {
      const dir = path.join(dist, 'projects', project.id);
      await mkdir(dir, { recursive: true });
      await writeFile(
        path.join(dir, 'index.html'),
        projectPage(project, base, projectsData)
      );
      console.log(`  projects/${project.id}/  ${project.title}`);
    }
    await mkdir(path.join(dist, 'projects'), { recursive: true });
    await writeFile(
      path.join(dist, 'projects', 'index.html'),
      projectsIndexPage(projectsData, base)
    );
    console.log(`  projects/  index over ${projectsData.length} projects`);
  }

  await mkdir(path.join(dist, 'journal'), { recursive: true });
  await writeFile(path.join(dist, 'journal', 'index.html'), indexPage(journalEntriesData, base));
  await writeFile(path.join(dist, 'robots.txt'), robotsTxt());
  await writeFile(
    path.join(dist, 'sitemap.xml'),
    sitemapXml(base, journalEntriesData, projectsData)
  );

  console.log(`\n${journalEntriesData.length} article pages + journal index -> dist/journal/`);
  console.log(`sitemap.xml + robots.txt (Disallow: /) -> dist/`);
} finally {
  await server.close();
}
