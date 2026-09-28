/**
 * Writes dist/rss.xml from the same journal data the SPA and the static article
 * pages use.
 *
 * The feed previously carried its own hand-copied copy of the entries, which
 * meant the site and the feed could disagree about titles, dates and — because
 * the copies shipped `content: []` — the feed shipped five empty items pointing
 * at production URLs. Loading the real module removes the second source of
 * truth entirely.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE_ORIGIN = 'https://kashcmdd.github.io';
const AUTHOR_NAME = 'KashhCMD';
// GitHub's no-reply address, so the feed declares a contact that cannot bounce
// into a real inbox. A placeholder like contact@example.com is worse than none.
const AUTHOR_EMAIL = 'kashcmdd@users.noreply.github.com';

const MONTHS = { JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06', JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12' };

const esc = (value = '') =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );

// "SEP 25, 2026" is not a format Date.parse accepts everywhere, so convert
// before constructing. Feeding it straight in yields an Invalid Date and a
// pubDate of "Invalid Date" in the output.
const toIso = (date) => {
  const m = String(date).match(/^([A-Z]{3})\s+(\d{1,2}),\s*(\d{4})$/);
  if (!m || !MONTHS[m[1]]) return null;
  return `${m[3]}-${MONTHS[m[1]]}-${m[2].padStart(2, '0')}`;
};

const toPubDate = (date) => {
  const iso = toIso(date);
  if (!iso) return new Date(0).toUTCString();
  return new Date(`${iso}T00:00:00Z`).toUTCString();
};

function renderBlock(block) {
  switch (block.type) {
    case 'heading':
      return `<h3>${esc(block.text)}</h3>`;
    case 'code':
      return `<pre><code class="language-${esc(block.language)}">${esc(block.code)}</code></pre>`;
    case 'list': {
      const tag = block.ordered ? 'ol' : 'ul';
      return `<${tag}>${block.items.map((item) => `<li>${esc(item)}</li>`).join('')}</${tag}>`;
    }
    case 'quote':
      return `<blockquote><p>${esc(block.text)}</p>${
        block.attribution ? `<footer>— ${esc(block.attribution)}</footer>` : ''
      }</blockquote>`;
    case 'image':
      return `<figure><img src="${esc(block.src)}" alt="${esc(block.alt)}" />${
        block.caption ? `<figcaption>${esc(block.caption)}</figcaption>` : ''
      }</figure>`;
    case 'paragraph':
    default:
      return `<p>${esc(block.text)}</p>`;
  }
}

// The body goes inside CDATA, where only the closing sequence needs care.
const cdata = (html) => html.split(']]>').join(']]]]><![CDATA[>');

const server = await createServer({
  root,
  configFile: path.join(root, 'vite.config.ts'),
  server: { middlewareMode: true, hmr: false, watch: null },
  optimizeDeps: { noDiscovery: true, include: [] },
  appType: 'custom',
  logLevel: 'error',
});

try {
  const { journalEntriesData } = await server.ssrLoadModule('/src/data/portfolioData.ts');
  const base = server.config.base || '/';
  const site = `${SITE_ORIGIN}${base}`;

  if (!journalEntriesData?.length) throw new Error('no journal entries loaded');

  const items = journalEntriesData
    .map((entry) => {
      const url = `${site}journal/${entry.id}/`;
      const content = entry.content.map(renderBlock).join('\n');
      return `    <item>
      <title>${esc(entry.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${esc(entry.subtitle)}</description>
      <pubDate>${toPubDate(entry.date)}</pubDate>
      <category>${esc(entry.category)}</category>
      <content:encoded><![CDATA[${cdata(content)}]]></content:encoded>
    </item>`;
    })
    .join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>KashhCMD Journal</title>
    <description>Technical articles on algorithms, performance and architecture</description>
    <link>${site}</link>
    <atom:link href="${site}rss.xml" rel="self" type="application/rss+xml" />
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>${esc(AUTHOR_EMAIL)} (${esc(AUTHOR_NAME)})</managingEditor>
    <webMaster>${esc(AUTHOR_EMAIL)} (${esc(AUTHOR_NAME)})</webMaster>
${items}
  </channel>
</rss>
`;

  const dist = path.join(root, 'dist');
  await mkdir(dist, { recursive: true });
  await writeFile(path.join(dist, 'rss.xml'), rss, 'utf8');
  console.log(`  rss.xml        ${journalEntriesData.length} items -> ${site}rss.xml`);
} finally {
  await server.close();
}
