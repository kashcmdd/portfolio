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

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE_ORIGIN = 'https://kashcmdd.github.io';
const MONTHS = { JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06', JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12' };

const esc = (value = '') =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );

const toIso = (date) => {
  const m = String(date).match(/^([A-Z]{3})\s+(\d{1,2}),\s*(\d{4})$/);
  if (!m || !MONTHS[m[1]]) return null;
  return `${m[3]}-${MONTHS[m[1]]}-${m[2].padStart(2, '0')}`;
};

// Unsplash URLs arrive at w=800; social cards want 1200x630.
const socialImage = (image) => (image || '').replace('w=800', 'w=1200&h=630');

function renderBlock(block) {
  switch (block.type) {
    case 'heading':
      return `<h2>${esc(block.text)}</h2>`;
    case 'code':
      return [
        '<figure class="code">',
        `<div class="codebar"><span>${esc(block.language)}</span></div>`,
        `<pre><code>${esc(block.code)}</code></pre>`,
        block.caption ? `<figcaption>${esc(block.caption)}</figcaption>` : '',
        '</figure>',
      ].join('');
    case 'list': {
      const tag = block.ordered ? 'ol' : 'ul';
      return `<${tag}>${block.items.map((item) => `<li>${esc(item)}</li>`).join('')}</${tag}>`;
    }
    case 'quote':
      return [
        '<blockquote>',
        `<p>${esc(block.text)}</p>`,
        block.attribution ? `<footer>— ${esc(block.attribution)}</footer>` : '',
        '</blockquote>',
      ].join('');
    case 'image':
      return [
        '<figure class="shot">',
        `<img src="${esc(block.src)}" alt="${esc(block.alt)}" loading="lazy" />`,
        block.caption ? `<figcaption>${esc(block.caption)}</figcaption>` : '',
        '</figure>',
      ].join('');
    case 'paragraph':
    default:
      return `<p>${esc(block.text)}</p>`;
  }
}

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
  .codebar {
    padding: 8px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, .1);
    background: rgba(255, 255, 255, .02);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 10px;
    letter-spacing: .18em;
    text-transform: uppercase;
    color: #8a8a8a;
  }
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
  @media (max-width: 640px) {
    .more a { flex-direction: column; gap: 4px; }
  }
`;

const head = ({ title, description, canonical, image, imageAlt, prefix, type = 'article' }) => `
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)} — KashhCMD</title>
    <meta name="description" content="${esc(description)}" />
    <meta name="robots" content="index, follow" />
    <meta name="author" content="KashhCMD" />
    <meta name="color-scheme" content="dark" />
    <meta name="theme-color" content="#0a0a0a" />
    <link rel="canonical" href="${canonical}" />
    <link rel="icon" type="image/svg+xml" href="${prefix}favicon.svg" />
    <link rel="apple-touch-icon" href="${prefix}apple-touch-icon.png" />
    <meta property="og:type" content="${type}" />
    <meta property="og:site_name" content="KashhCMD" />
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

function articlePage(entry, base, all) {
  const canonical = `${SITE_ORIGIN}${base}journal/${entry.id}/`;
  const published = toIso(entry.date);
  const others = all.filter((e) => e.id !== entry.id);

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
        ${entry.content.map(renderBlock).join('\n        ')}
      </article>
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
      · All articles are static pages: no JavaScript, no server.
    </div>
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
  const { journalEntriesData } = await server.ssrLoadModule('/src/data/portfolioData.ts');
  const base = server.config.base || '/portfolio/';
  const dist = path.join(root, 'dist');

  if (!journalEntriesData?.length) throw new Error('no journal entries loaded');

  for (const entry of journalEntriesData) {
    const dir = path.join(dist, 'journal', entry.id);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), articlePage(entry, base, journalEntriesData));
    console.log(`  journal/${entry.id}/  ${entry.title}`);
  }

  await mkdir(path.join(dist, 'journal'), { recursive: true });
  await writeFile(path.join(dist, 'journal', 'index.html'), indexPage(journalEntriesData, base));

  console.log(`\n${journalEntriesData.length} article pages + journal index -> dist/journal/`);
} finally {
  await server.close();
}
