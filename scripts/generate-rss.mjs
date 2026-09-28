import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import journal data - using require to avoid TypeScript import issues
const journalDataPath = path.join(__dirname, '..', 'src', 'data', 'portfolioData.ts');
// Since we can't import TypeScript directly in Node.js, we'll use a simpler approach
// Copy the journal data directly here for now
const journalEntriesData = [
  {
    id: "elo-decay",
    title: "Your Ladder Needs to Forget",
    subtitle: "Rating decay is the least interesting part of a ranked system to build, and the easiest thing to get wrong.",
    date: "SEP 25, 2026",
    readTime: "7 MIN READ",
    category: "ALGORITHMS",
    image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=800&q=80",
    content: []
  },
  {
    id: "bundle-splitting",
    title: "Cutting 59% Off My Portfolio's JavaScript",
    subtitle: "One static import was costing more than React, the router and every icon combined.",
    date: "SEP 25, 2026",
    readTime: "6 MIN READ",
    category: "PERFORMANCE",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    content: []
  },
  {
    id: "sqlite-postgres",
    title: "SQLite Is Fine Until It Isn't",
    subtitle: "The database that starts embedded and ends up distributed.",
    date: "SEP 25, 2026",
    readTime: "5 MIN READ",
    category: "DATABASES",
    image: "https://images.unsplash.com/photo-1544383845-d3f53dc44cbb?auto=format&fit=crop&w=800&q=80",
    content: []
  },
  {
    id: "base-paths",
    title: "No Router, No Server, No 404",
    subtitle: "Deploying a single-page app to GitHub Pages without rewrite rules.",
    date: "SEP 25, 2026",
    readTime: "6 MIN READ",
    category: "DEPLOYMENT",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    content: []
  },
  {
    id: "content-model",
    title: "Markdown Was Never Going to Work Here",
    subtitle: "Why I switched to a custom content model for my journal.",
    date: "SEP 25, 2026",
    readTime: "5 MIN READ",
    category: "ARCHITECTURE",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80",
    content: []
  }
];

const SITE_URL = 'https://kashcmdd.github.io/portfolio';
const AUTHOR_NAME = 'KashhCMD';
const AUTHOR_EMAIL = 'contact@example.com';

function generateRSS() {
  const items = journalEntriesData.map((entry) => {
    const entryUrl = `${SITE_URL}/journal/${entry.id}/`;
    const pubDate = new Date(entry.date).toUTCString();
    
    // Convert content blocks to HTML
    const content = entry.content.map((block) => {
      switch (block.type) {
        case 'paragraph':
          return `<p>${block.text}</p>`;
        case 'heading':
          return `<h3>${block.text}</h3>`;
        case 'code':
          return `<pre><code class="language-${block.language}">${escapeHtml(block.code)}</code></pre>`;
        case 'list':
          const listType = block.ordered ? 'ol' : 'ul';
          const items = block.items.map(item => `<li>${item}</li>`).join('');
          return `<${listType}>${items}</${listType}>`;
        case 'quote':
          return `<blockquote>${block.text}${block.attribution ? `<cite>— ${block.attribution}</cite>` : ''}</blockquote>`;
        case 'image':
          return `<img src="${block.src}" alt="${block.alt}" />${block.caption ? `<figcaption>${block.caption}</figcaption>` : ''}`;
        default:
          return '';
      }
    }).join('\n');

    return `
      <item>
        <title>${escapeHtml(entry.title)}</title>
        <description>${escapeHtml(entry.subtitle)}</description>
        <link>${entryUrl}</link>
        <guid isPermaLink="true">${entryUrl}</guid>
        <pubDate>${pubDate}</pubDate>
        <category>${escapeHtml(entry.category)}</category>
        <content:encoded><![CDATA[${content}]]></content:encoded>
      </item>
    `;
  }).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>KashhCMD Journal</title>
    <description>Technical articles on algorithms, performance, and architecture</description>
    <link>${SITE_URL}/</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>${escapeHtml(AUTHOR_EMAIL)} (${escapeHtml(AUTHOR_NAME)})</managingEditor>
    <webMaster>${escapeHtml(AUTHOR_EMAIL)}</webMaster>
    ${items}
  </channel>
</rss>`;

  return rss;
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Write RSS feed
const distDir = path.join(__dirname, '..', 'dist');
const rssPath = path.join(distDir, 'rss.xml');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

fs.writeFileSync(rssPath, generateRSS(), 'utf8');
console.log('✓ RSS feed generated at dist/rss.xml');
