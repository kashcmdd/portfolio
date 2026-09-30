/**
 * Journal rendering primitives shared by the two build scripts.
 *
 * generate-journal-pages.mjs (static article pages) and generate-rss.mjs (feed)
 * both turn the same `content: JournalBlock[]` arrays into HTML, and until now
 * each carried its own copy of the escaping, the date parser and the block
 * switch. They drifted quietly: the feed rendered headings as <h3> where the
 * pages used <h2>, and any block type added to one had to be remembered in the
 * other. One implementation means the page and the feed cannot disagree about
 * what an entry says.
 *
 * The only real difference is presentation, expressed through options:
 *   - `headingLevel`: pages nest an <h2> under the <h1> title, while feed
 *     content sits inside an <item> that has no document outline, so <h3>.
 *   - `rich`: the article pages ship their own stylesheet and use classed
 *     <figure> wrappers for code and images; the feed ships bare tags because
 *     no stylesheet travels with it.
 */
import { highlightCode } from './prism.mjs';
import { outlineSlugs, articleOutline } from './journal-outline.mjs';

export const MONTHS = {
  JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
  JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12',
};

export const esc = (value = '') =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );

// "SEP 25, 2026" is not a format Date.parse accepts everywhere, so convert
// before constructing. Feeding it straight in yields an Invalid Date.
export const toIso = (date) => {
  const m = String(date).match(/^([A-Z]{3})\s+(\d{1,2}),\s*(\d{4})$/);
  if (!m || !MONTHS[m[1]]) return null;
  return `${m[3]}-${MONTHS[m[1]]}-${m[2].padStart(2, '0')}`;
};

export const toPubDate = (date) => {
  const iso = toIso(date);
  if (!iso) return new Date(0).toUTCString();
  return new Date(`${iso}T00:00:00Z`).toUTCString();
};

/**
 * Headings of an article in document order, with the same ids renderBlocks
 * will emit. A table of contents built from this is guaranteed to link to
 * headings that exist, because both walk the content with the same slugger.
 */
export { articleOutline };

/** renderBlock for a whole article, threading heading ids through the document. */
export function renderBlocks(blocks = [], opts = {}) {
  const slugs = outlineSlugs(blocks);
  return blocks.map((block, i) => renderBlock(block, { ...opts, slug: slugs[i] || '' }));
}

export function renderBlock(block, { headingLevel = 2, rich = false, slug = '' } = {}) {  switch (block.type) {
    case 'heading': {
      const tag = `h${headingLevel}`;
      return `<${tag}${slug ? ` id="${esc(slug)}"` : ''}>${esc(block.text)}</${tag}>`;
    }
    case 'code':
      return rich
        ? [
            '<figure class="code">',
            `<div class="codebar"><span>${esc(block.language)}</span>`,
            // The raw source never has to be embedded: the highlighted <code>
            // element's textContent is the original text, since token spans
            // add only markup. The article page script copies from there.
            '<button type="button" class="copy" data-copy-code>Copy</button>',
            '</div>',
            `<pre class="prism-code"><code>${highlightCode(block.code, block.language)}</code></pre>`,
            block.caption ? `<figcaption>${esc(block.caption)}</figcaption>` : '',
            '</figure>',
          ].join('')
        : `<pre><code class="language-${esc(block.language)}">${esc(block.code)}</code></pre>`;
    case 'list': {
      const tag = block.ordered ? 'ol' : 'ul';
      return `<${tag}>${block.items.map((item) => `<li>${esc(item)}</li>`).join('')}</${tag}>`;
    }
    case 'quote':
      return rich
        ? [
            '<blockquote>',
            `<p>${esc(block.text)}</p>`,
            block.attribution ? `<footer>— ${esc(block.attribution)}</footer>` : '',
            '</blockquote>',
          ].join('')
        : `<blockquote><p>${esc(block.text)}</p>${
            block.attribution ? `<footer>— ${esc(block.attribution)}</footer>` : ''
          }</blockquote>`;
    case 'image':
      return rich
        ? [
            '<figure class="shot">',
            `<img src="${esc(block.src)}" alt="${esc(block.alt)}" loading="lazy" />`,
            block.caption ? `<figcaption>${esc(block.caption)}</figcaption>` : '',
            '</figure>',
          ].join('')
        : `<figure><img src="${esc(block.src)}" alt="${esc(block.alt)}" />${
            block.caption ? `<figcaption>${esc(block.caption)}</figcaption>` : ''
          }</figure>`;
    case 'paragraph':
    default:
      return `<p>${esc(block.text)}</p>`;
  }
}

/**
 * Reads the Vite base and refuses to invent one.
 *
 * Both scripts write absolute URLs, so a wrong base does not fail the build —
 * it silently ships links to some other project's paths (including this
 * repository's production predecessor). A hard failure here is the only way
 * that mistake gets noticed, so the caller has to configure a base.
 */
export const requireBase = (config, label) => {
  const base = config?.base;
  if (!base || base === '/') {
    throw new Error(
      `${label}: Vite resolved base to ${JSON.stringify(base ?? null)}. ` +
        'Set `base` in vite.config.ts before generating site URLs.'
    );
  }
  return base;
};

/**
 * Renders the same typed blocks as Markdown.
 *
 * The HTML pages are for humans and crawlers; this is for everything else that
 * reads the site without a browser — an LLM assistant, a docs tool, a script.
 * It is a third renderer over one union, so it lives beside the other two: if a
 * block type is added, it is added here in the same commit or the generated
 * .md silently loses a section. No HTML escaping: the output is text, not a
 * document, and escaping there would corrupt the code samples it is meant to
 * preserve.
 */
export function blocksToMarkdown(blocks = []) {
  return blocks
    .map((block) => {
      switch (block.type) {
        case 'heading':
          return `## ${block.text}`;
        case 'code':
          return [
            '```' + (block.language || ''),
            block.code,
            '```',
            block.caption ? `_${block.caption}_` : '',
          ]
            .filter(Boolean)
            .join('\n');
        case 'list':
          return block.items
            .map((item, i) => (block.ordered ? `${i + 1}. ${item}` : `- ${item}`))
            .join('\n');
        case 'quote':
          return [
            `> ${block.text}`,
            block.attribution ? `>\n> — ${block.attribution}` : '',
          ]
            .filter(Boolean)
            .join('\n');
        case 'image':
          return [`![${block.alt}](${block.src})`, block.caption ? `_${block.caption}_` : '']
            .filter(Boolean)
            .join('\n');
        case 'paragraph':
        default:
          return block.text;
      }
    })
    .join('\n\n');
}
