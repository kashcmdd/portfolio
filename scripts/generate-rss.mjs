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
import { esc, toPubDate, renderBlock, requireBase } from './lib/journal-blocks.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE_ORIGIN = 'https://kashcmdd.github.io';
const AUTHOR_NAME = 'KashhCMD';
// GitHub's no-reply address, so the feed declares a contact that cannot bounce
// into a real inbox. A placeholder like contact@example.com is worse than none.
const AUTHOR_EMAIL = 'kashcmdd@users.noreply.github.com';

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
  const base = requireBase(server.config, 'generate-rss');
  const site = `${SITE_ORIGIN}${base}`;

  if (!journalEntriesData?.length) throw new Error('no journal entries loaded');

  const items = journalEntriesData
    .map((entry) => {
      const url = `${site}journal/${entry.id}/`;
      // Feed items carry no surrounding document, so blocks stay unstyled and
      // headings drop to h3 to sit under the item title.
      const content = entry.content
        .map((block) => renderBlock(block, { headingLevel: 3, rich: false }))
        .join('\n');
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
