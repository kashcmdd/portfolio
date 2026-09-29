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

// Unsplash URLs arrive at w=800; social cards want 1200x630. Project images are
// build-time assets that stay root-relative (asset() bakes the base path in at
// import time), and social crawlers reject relative URLs, so those get promoted
// to the canonical origin here. Sources that are already absolute — Unsplash and
// the site og-image — pass through untouched.
const socialImage = (image) => {
  const sized = (image || '').replace('w=800', 'w=1200&h=630');
  if (!sized || /^https?:\/\//i.test(sized)) return sized;
  return `${SITE_ORIGIN}${sized}`;
};

// The article pages live at /journal/<id>/ and the index at /journal/, so each
// needs a different prefix to reach the site root where fonts and icons live.
const shareBar = (url, title) => {
  const u = encodeURIComponent(url);
  const text = encodeURIComponent(`${title} — KashhCMD`);
  return `<div class="share">
        <span class="share-label">Share</span>
        <a class="share-btn" href="https://twitter.com/intent/tweet?text=${text}&url=${u}" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">X</span><span class="sr-only">Share ${esc(title)} on X</span></a>
        <a class="share-btn" href="https://www.linkedin.com/sharing/share-offsite/?url=${u}" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">in</span><span class="sr-only">Share ${esc(title)} on LinkedIn</span></a>
        <button class="share-btn" type="button" data-copy="${esc(url)}"><span data-copy-label>Copy link</span><span class="sr-only"> for ${esc(title)}</span></button>
        <span class="sr-only" data-copy-status role="status"></span>
      </div>`;
};

// One delegated listener serves every button on the page, and the fallback keeps
// the button honest when the async clipboard API is unavailable, which is the
// case on any non-HTTPS origin.
const SHARE_SCRIPT = `<script>
  (function () {
    var status = document.querySelector('[data-copy-status]');
    function fallback(value) {
      var field = document.createElement('textarea');
      field.value = value;
      field.setAttribute('readonly', '');
      field.style.position = 'absolute';
      field.style.left = '-9999px';
      document.body.appendChild(field);
      field.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(field);
      return ok;
    }
    document.addEventListener('click', function (event) {
      var button = event.target.closest('[data-copy]');
      if (!button) return;
      var value = button.getAttribute('data-copy');
      var done = function (ok) {
        if (!ok) return;
        button.querySelector('[data-copy-label]').textContent = 'Copied';
        if (status) status.textContent = 'Link copied to clipboard';
        setTimeout(function () {
          button.querySelector('[data-copy-label]').textContent = 'Copy link';
          if (status) status.textContent = '';
        }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(function () { done(true); }, function () { done(fallback(value)); });
      } else {
        done(fallback(value));
      }
    });
  })();
</script>`;

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
  .share {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin: 0 0 28px;
  }
  .share-label {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: .1em;
    color: #737373;
  }
  .share-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid rgba(255, 255, 255, .1);
    background: #141414;
    color: #d4d4d4;
    border-radius: 999px;
    padding: 6px 14px;
    font-family: inherit;
    font-size: 12px;
    line-height: 1.4;
    text-decoration: none;
    cursor: pointer;
  }
  .share-btn:hover { background: #1f1f1f; border-color: rgba(255, 255, 255, .2); color: #fff; }
  .share-btn:focus-visible { outline: 2px solid #89AACC; outline-offset: 2px; }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
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
  .arch-summary { color: #c9c9c9; }
  .arch-details {
    margin: 14px 0 0;
    border: 1px solid rgba(255, 255, 255, .1);
    border-radius: 12px;
    background: rgba(255, 255, 255, .02);
    overflow: hidden;
  }
  .arch-details summary {
    cursor: pointer;
    padding: 12px 16px;
    font-size: .85rem;
    color: #b4b4b4;
    list-style: none;
  }
  .arch-details summary::-webkit-details-marker { display: none; }
  .arch-details summary::after { content: '+'; float: right; color: #89AACC; }
  .arch-details[open] summary::after { content: '\u2013'; }
  .arch-details summary:focus-visible { outline: 2px solid #89AACC; outline-offset: -2px; }
  .arch-details p { padding: 0 16px; margin: 14px 0 6px; color: #b4b4b4; font-size: .85rem; }
  .arch-layers { margin: 0; padding: 0 16px 4px; list-style: none; }
  .arch-nodes, .arch-edges { margin: 0; padding: 0 16px 4px 34px; color: #b4b4b4; font-size: .85rem; }
  .arch-details > :last-child { margin-bottom: 16px; }
  .outcome {
    margin: 0 0 30px;
    padding: 14px 16px;
    border: 1px solid rgba(137, 170, 204, .3);
    background: rgba(137, 170, 204, .08);
    border-radius: 14px;
    color: #dbe6f0;
    font-size: .95rem;
  }
  .decision {
    margin: 0 0 30px;
    padding: 16px 18px;
    border: 1px solid rgba(137, 170, 204, .3);
    background: rgba(137, 170, 204, .08);
    border-radius: 14px;
  }
  .decision h2 {
    margin: 0 0 10px;
    font-size: .7rem;
    font-weight: 600;
    letter-spacing: .22em;
    text-transform: uppercase;
    color: #89AACC;
  }
  .decision dl { margin: 0; display: grid; grid-template-columns: auto 1fr; gap: 6px 12px; }
  .decision dt {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 10px;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: #8a8a8a;
    padding-top: 2px;
  }
  .decision dd { margin: 0; font-size: .9rem; color: #e5e5e5; }
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
  const canonical = `${SITE_ORIGIN}${base}projects/`;
  const description =
    'Selected work: web apps, Discord bots and frontend experiments by KashhCMD.';
  return `<!DOCTYPE html>
<html lang="en">
  <head>${head({
    title: 'Projects',
    description,
    canonical,
    image: `${SITE_ORIGIN}${base}og-image.jpg`,
    imageAlt: 'KashhCMD — Discord bots and web apps, built end to end.',
    prefix: '../',
    type: 'website',
  })}
    <style>${cssFor('../')}</style>
    <script type="application/ld+json">${projectsIndexJsonLd(all, base)}</script>
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

// The index is a list of the project pages, so it gets a CollectionPage whose
// hasPart mirrors the visible cards. The site og-image stands in here: the index
// has no cover of its own, and a crawler will not chase a page that lacks one.
const projectsIndexJsonLd = (projects, base) =>
  JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Projects',
    url: `${SITE_ORIGIN}${base}projects/`,
    author: { '@type': 'Person', name: 'KashhCMD' },
    hasPart: projects.map((project) => ({
      '@type': 'CreativeWork',
      name: project.title,
      url: `${SITE_ORIGIN}${base}projects/${project.id}/`,
    })),
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
  // Edges are stored as ids; the reader wants the human labels.
  const nodeLabel = (id) =>
    project.architecture?.nodes.find((node) => node.id === id)?.label || id;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(project.title)} - KashhCMD</title>
    <meta name="description" content="${esc(project.subtitle)}" />
    <meta name="robots" content="noindex, nofollow" />
    <meta name="author" content="KashhCMD" />
    <meta name="color-scheme" content="dark" />
    <meta name="theme-color" content="#0a0a0a" />
    <link rel="canonical" href="${esc(canonical)}" />
    <link rel="icon" type="image/svg+xml" href="../../favicon.svg" />
    <link rel="apple-touch-icon" href="../../apple-touch-icon.png" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="KashhCMD (Dev)" />
    <meta property="og:title" content="${esc(project.title)}" />
    <meta property="og:description" content="${esc(project.subtitle)}" />
    <meta property="og:url" content="${esc(canonical)}" />
    <meta property="og:image" content="${esc(socialImage(project.image))}" />
    <meta property="og:image:alt" content="${esc(project.title)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(project.title)}" />
    <meta name="twitter:description" content="${esc(project.subtitle)}" />
    <meta name="twitter:image" content="${esc(socialImage(project.image))}" />
    <meta name="twitter:image:alt" content="${esc(project.title)}" />
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
        ${project.outcome ? `<p class="outcome">${esc(project.outcome)}</p>` : ''}

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

        ${project.architecture && project.architecture.summary
          ? `<h2>How It Fits Together</h2>
        <p class="arch-summary">${esc(project.architecture.summary)}</p>
        <details class="arch-details">
          <summary>View layers and connections</summary>
          <p><strong>Layers</strong></p>
          <ul class="arch-layers">
            ${project.architecture.layers
              .map((layer) => `<li>${esc(layer.title)}</li>`)
              .join('\n            ')}
          </ul>
          <p><strong>Components</strong></p>
          <ul class="arch-nodes">
            ${project.architecture.nodes
              .map(
                (node) =>
                  `<li><strong>${esc(node.label)}</strong>${
                    node.detail ? ` — ${esc(node.detail)}` : ''
                  }</li>`
              )
              .join('\n            ')}
          </ul>
          <p><strong>Connections</strong></p>
          <ul class="arch-edges">
            ${project.architecture.edges
              .map(
                (edge) =>
                  `<li>${esc(nodeLabel(edge.from))} → ${esc(nodeLabel(edge.to))}${
                    edge.label ? ` (${esc(edge.label)})` : ''
                  }</li>`
              )
              .join('\n            ')}
          </ul>
        </details>`
          : ''
        }

        ${project.githubUrl || project.liveUrl
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
        ${shareBar(canonical, entry.title)}
        <img class="banner" src="${esc(entry.image)}" alt="${esc(entry.title)}" />
        ${entry.decision
          ? `<div class="decision">
          <h2>Decision</h2>
          <dl>
            <dt>Chose</dt><dd>${esc(entry.decision.chose)}</dd>
            <dt>Over</dt><dd>${esc(entry.decision.over)}</dd>
          </dl>
        </div>`
          : ''}
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
    ${SHARE_SCRIPT}
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
// A skills-based resume: it is built entirely from data that already exists in
// portfolioData.ts, so it cannot drift into claiming an employer, a role or a
// date that was never recorded. The print rules below are what make "Save as
// PDF" produce a clean single-column A4/Letter document rather than a
// screenshot of a dark web page.
const RESUME_CSS = `
  *, *::before, *::after { box-sizing: border-box; }

  /* The pages preload these two files in <head>, so declaring them here is what
     actually puts them to use rather than letting the preload go to waste. The
     paths are relative to /resume/, which is the only page this sheet serves. */
  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 300 700;
    font-display: swap;
    src: url('../fonts/inter-normal-latin.woff2') format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
  }
  @font-face {
    font-family: 'Instrument Serif';
    font-style: italic;
    font-weight: 400;
    font-display: swap;
    src: url('../fonts/instrument-serif-italic-latin.woff2') format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
  }

  :root { --accent: #89AACC; --line: rgba(255, 255, 255, .1); --muted: #9a9a9a; }
  body {
    margin: 0;
    background: #0a0a0a;
    color: #e5e5e5;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    font-size: 15px;
    line-height: 1.6;
    background-image: radial-gradient(900px 520px at 82% -12%, rgba(137, 170, 204, .16), transparent 62%);
    background-attachment: fixed;
  }
  .wrap { max-width: 860px; margin: 0 auto; padding: 40px 24px 96px; }

  .top {
    position: sticky; top: 0; z-index: 5;
    display: flex; justify-content: space-between; align-items: center; gap: 16px;
    padding: 12px 24px;
    background: rgba(10, 10, 10, .82);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--line);
  }
  .brand {
    color: #fff; text-decoration: none; font-size: 20px;
    font-family: 'Instrument Serif', Georgia, serif; font-style: italic;
  }
  .top-actions { display: flex; gap: 8px; }
  .print-btn {
    display: inline-flex; align-items: center; gap: 8px;
    border: 1px solid var(--line);
    background: rgba(255, 255, 255, .03); color: #e5e5e5;
    border-radius: 999px; padding: 8px 16px;
    font: inherit; font-size: 13px; text-decoration: none; cursor: pointer;
    transition: background .2s, border-color .2s;
  }
  .print-btn:hover { background: rgba(255, 255, 255, .08); border-color: rgba(255, 255, 255, .28); }
  .print-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

  .note {
    margin: 0 0 24px; padding: 10px 14px;
    border: 1px solid rgba(137, 170, 204, .25);
    border-radius: 12px; background: rgba(137, 170, 204, .06);
    color: #a9bccd; font-size: 12.5px;
  }

  header.masthead {
    display: flex; align-items: center; gap: 22px;
    padding: 28px; margin-bottom: 30px;
    border: 1px solid var(--line); border-radius: 24px;
    background: linear-gradient(135deg, rgba(255, 255, 255, .055), rgba(255, 255, 255, .012));
  }
  .monogram {
    width: 74px; height: 74px; flex: 0 0 74px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 22px; color: #0a0a0a;
    font-family: 'Instrument Serif', Georgia, serif; font-style: italic;
    font-size: 36px;
    background: linear-gradient(135deg, #89AACC, #4E85BF);
    box-shadow: 0 12px 30px rgba(137, 170, 204, .25);
  }
  header.masthead h1 {
    margin: 0; color: #fff;
    font-family: 'Instrument Serif', Georgia, serif; font-style: italic; font-weight: 400;
    font-size: 42px; line-height: 1.05; letter-spacing: -.01em;
  }
  header.masthead .role { margin: 6px 0 0; font-size: 16px; color: var(--accent); }
  header.masthead .contact {
    margin: 10px 0 0; font-size: 13px; color: var(--muted);
    display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
  }
  header.masthead .contact a {
    color: #dbe6f0; text-decoration: none;
    border-bottom: 1px solid rgba(137, 170, 204, .4);
  }
  header.masthead .contact .sep { width: 4px; height: 4px; border-radius: 50%; background: #555; }

  section { margin: 0 0 34px; }
  h2 {
    display: flex; align-items: center; gap: 10px;
    margin: 0 0 16px; font-size: 12px; font-weight: 700;
    text-transform: uppercase; letter-spacing: .18em; color: var(--accent);
  }
  h2::before { content: ''; width: 22px; height: 1px; background: var(--accent); opacity: .7; }
  .bio { margin: 0; color: #c8c8c8; }

  .skill-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
  .skill-group {
    padding: 14px 16px; border: 1px solid var(--line); border-radius: 16px;
    background: rgba(255, 255, 255, .022);
  }
  .skill-group h3 { margin: 0 0 10px; font-size: 13px; font-weight: 600; color: #fff; }
  .skill-row { display: flex; flex-wrap: wrap; gap: 7px; }
  .skill {
    display: inline-flex; align-items: baseline; gap: 6px;
    border: 1px solid var(--line); background: rgba(255, 255, 255, .03);
    border-radius: 999px; padding: 3px 11px; font-size: 12.5px; color: #e5e5e5;
  }
  .skill .lv { color: #8a8a8a; font-size: 10.5px; text-transform: uppercase; letter-spacing: .06em; }
  .skill[data-level="Expert"] { border-color: rgba(137, 170, 204, .5); background: rgba(137, 170, 204, .08); }
  .skill[data-level="Expert"] .lv { color: var(--accent); }

  .project-grid { display: grid; gap: 14px; }
  .project {
    padding: 18px 20px; border: 1px solid var(--line); border-radius: 18px;
    background: linear-gradient(180deg, rgba(255, 255, 255, .035), rgba(255, 255, 255, .012));
  }
  .project-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px; }
  .project-head h3 { margin: 0; font-size: 17px; color: #fff; }
  .p-cat {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 10.5px; text-transform: uppercase; letter-spacing: .1em; color: var(--accent);
    border: 1px solid rgba(137, 170, 204, .3); border-radius: 999px; padding: 2px 9px;
  }
  .p-desc { margin: 8px 0 0; color: #c8c8c8; font-size: 14px; }
  .p-tags { margin: 10px 0 0; display: flex; flex-wrap: wrap; gap: 6px; }
  .p-tag {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11px; color: #b4b4b4;
    border: 1px solid var(--line); border-radius: 6px; padding: 1px 7px;
  }
  .p-links { margin: 12px 0 0; display: flex; gap: 16px; font-size: 12.5px; }
  .p-links a { color: var(--accent); text-decoration: none; }
  .p-links a:hover { text-decoration: underline; }

  footer.end {
    margin-top: 44px; padding-top: 18px;
    border-top: 1px solid var(--line); color: #737373; font-size: 12px;
  }
  footer.end a { color: var(--accent); text-decoration: none; }

  @media (max-width: 640px) {
    .skill-grid { grid-template-columns: 1fr; }
    header.masthead { flex-direction: column; align-items: flex-start; }
    header.masthead h1 { font-size: 34px; }
  }

  @page { margin: 14mm; }
  @media print {
    html { background: #fff; color-scheme: light; }
    body { background: #fff; color: #111; font-size: 10.5pt; line-height: 1.4; background-image: none; }
    .top, .note, .no-print { display: none !important; }
    .wrap { max-width: none; padding: 0; }
    header.masthead {
      display: block; padding: 0 0 12px; margin-bottom: 16px; border: none;
      border-bottom: 2px solid #bbb; border-radius: 0; background: none;
    }
    .monogram { display: none; }
    header.masthead h1 { color: #000; font-size: 22pt; }
    header.masthead .role { color: #24506e; }
    header.masthead .contact { color: #444; }
    header.masthead .contact a { color: #24506e; border-bottom: none; }
    header.masthead .contact .sep { background: #999; }
    .bio { color: #222; }
    h2 { color: #24506e; border-bottom: 1px solid #bbb; padding-bottom: 4px; break-after: avoid; }
    h2::before { display: none; }
    .skill-grid, .project-grid { display: block; }
    .skill-group, .project {
      border: none; background: none; padding: 0; margin: 0 0 10pt; break-inside: avoid;
    }
    .skill-group h3, .project-head h3 { color: #000; }
    .skill { border-color: #ccc; background: none; color: #111; border-radius: 4px; }
    .skill .lv { color: #555; }
    .skill[data-level="Expert"] { background: none; border-color: #24506e; }
    .skill[data-level="Expert"] .lv { color: #24506e; }
    .p-cat { border-color: #999; color: #333; }
    .p-desc { color: #222; }
    .p-tag { color: #333; border-color: #ccc; }
    .p-links a { color: #24506e; }
    footer.end { color: #666; border-top-color: #ccc; }
    a { text-decoration: none; }
    section { margin-bottom: 14pt; }
  }
`;

function resumePage({ skills, projects, details }, base) {
  const canonical = `${SITE_ORIGIN}${base}resume/`;
  const skillGroups = Array.from(new Set(skills.map((s) => s.category))).map((category) => ({
    category,
    items: skills.filter((s) => s.category === category),
  }));
  const levelRank = { Expert: 0, Advanced: 1, Proficient: 2 };
  const monogram = esc(details.name.charAt(0).toUpperCase());

  return `<!doctype html>
<html lang="en">
  <head>${head({
    title: `${details.name} — Resume`,
    description: `${details.name}, ${details.title}. Skills, tooling and selected projects.`,
    canonical,
    image: `${SITE_ORIGIN}${base}og-image.jpg`,
    imageAlt: `${details.name} — ${details.title}`,
    prefix: '../',
    type: 'profile',
  })}
    <style>${RESUME_CSS}</style>
  </head>
  <body>
    <div class="top">
      <a class="brand" href="../">KashhCMD</a>
      <div class="top-actions">
        <a class="print-btn no-print" href="../KashhCMD-Resume.pdf" download>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download PDF
        </a>
        <button class="print-btn no-print" type="button" id="save-pdf">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Print
        </button>
      </div>
    </div>
    <div class="wrap">
      <p class="note no-print">
        This resume is generated from the portfolio data, so it lists skills and
        projects only — there is no employment history to show. Download the PDF,
        or print this page if you would rather choose the destination yourself.
      </p>

      <header class="masthead">
        <div class="monogram" aria-hidden="true">${monogram}</div>
        <div>
          <h1>${esc(details.name)}</h1>
          <p class="role">${esc(details.title)}</p>
          <p class="contact">
            <a href="${esc(details.githubUrl)}">github.com/${esc(details.githubHandle)}</a>
            <span class="sep" aria-hidden="true"></span>
            <span>Discord bots &amp; web apps, built end to end</span>
          </p>
        </div>
      </header>

      <section>
        <h2>Summary</h2>
        <p class="bio">${esc(details.bio)}</p>
      </section>

      <section>
        <h2>Approach</h2>
        <p class="bio">${esc(details.philosophy)}</p>
      </section>

      <section>
        <h2>Skills</h2>
        <div class="skill-grid">
          ${skillGroups
            .map(
              (group) => `<div class="skill-group">
            <h3>${esc(group.category)}</h3>
            <div class="skill-row">
              ${group.items
                .slice()
                .sort((a, b) => (levelRank[a.level] ?? 9) - (levelRank[b.level] ?? 9))
                .map(
                  (skill) =>
                    `<span class="skill" data-level="${esc(skill.level)}">${esc(
                      skill.name
                    )}<span class="lv">${esc(skill.level)}</span></span>`
                )
                .join('\n              ')}
            </div>
          </div>`
            )
            .join('\n          ')}
        </div>
      </section>

      <section>
        <h2>Selected Projects</h2>
        <div class="project-grid">
          ${projects
            .map(
              (project) => `<article class="project">
            <div class="project-head">
              <h3>${esc(project.title)}</h3>
              <span class="p-cat">${esc(project.category)}</span>
            </div>
            <p class="p-desc">${esc(project.outcome || project.subtitle)}</p>
            <div class="p-tags">${project.tags
              .map((tag) => `<span class="p-tag">${esc(tag)}</span>`)
              .join('')}</div>
            <div class="p-links">
              ${project.githubUrl ? `<a href="${esc(project.githubUrl)}">Source</a>` : ''}
              ${project.liveUrl ? `<a href="${esc(project.liveUrl)}">Live</a>` : ''}
            </div>
          </article>`
            )
            .join('\n          ')}
        </div>
      </section>

      <footer class="end">
        Generated from the portfolio at <a href="${esc(`${SITE_ORIGIN}${base}`)}">${esc(
          `${SITE_ORIGIN}${base}`
        )}</a>.
      </footer>
    </div>
    <script>
      // The browser's own print pipeline is the PDF writer here. Bundling a
      // PDF library would add hundreds of kilobytes to produce a worse
      // document than the print stylesheet already produces.
      document.getElementById('save-pdf').addEventListener('click', function () { window.print(); });
    </script>
  </body>
</html>
`;
}

// Generated rather than added as a Vite HTML input because the links here have
// to be absolute. A 404 document is served *in place of* the URL that was
// requested, so a relative "./" would resolve against the missing page's
// directory and produce a second 404. The base is already known here.
const NOT_FOUND_CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
    background: #0a0a0a; color: #e5e5e5;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }
  .box { max-width: 560px; width: 100%; text-align: center; }
  .code {
    margin: 0; font-size: clamp(72px, 18vw, 132px); line-height: 1;
    font-weight: 700; letter-spacing: -.04em;
    background: linear-gradient(120deg, #89AACC, #4E85BF);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  h1 { margin: 12px 0 10px; font-size: 22px; font-weight: 600; color: #fff; }
  p { margin: 0 0 28px; color: #a3a3a3; line-height: 1.6; }
  code.path {
    display: inline-block; margin-top: 4px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 12.5px; color: #89AACC;
    background: rgba(137, 170, 204, .1);
    border: 1px solid rgba(137, 170, 204, .25);
    border-radius: 6px; padding: 4px 10px;
    max-width: 100%; overflow-wrap: anywhere;
  }
  .links { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
  .links a {
    display: inline-flex; align-items: center;
    border: 1px solid rgba(255, 255, 255, .12); background: #141414; color: #e5e5e5;
    border-radius: 999px; padding: 9px 18px; font-size: 13.5px; text-decoration: none;
  }
  .links a:hover { background: #1f1f1f; border-color: rgba(255, 255, 255, .28); color: #fff; }
  .links a:focus-visible { outline: 2px solid #89AACC; outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
`;

function notFoundPage(base) {
  const home = `${SITE_ORIGIN}${base}`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>404 — Page not found</title>
    <meta name="description" content="That page does not exist. Head back to the portfolio, the journal, or the project index." />
    <!-- A 404 must never be indexed, even though the rest of the generated
         pages here are deliberately noindex too. -->
    <meta name="robots" content="noindex, nofollow" />
    <link rel="icon" href="${esc(`${base}favicon.svg`)}" type="image/svg+xml" />
    <style>${NOT_FOUND_CSS}</style>
  </head>
  <body>
    <div class="box">
      <p class="code">404</p>
      <h1>This page doesn't exist.</h1>
      <p>
        The link may be broken, or the page may have moved. Nothing here is
        broken on your end.
      </p>
      <div class="links">
        <a href="${esc(home)}">Back to portfolio</a>
        <a href="${esc(`${base}journal/`)}">Journal</a>
        <a href="${esc(`${base}projects/`)}">Projects</a>
        <a href="${esc(`${base}resume/`)}">Resume</a>
      </div>
    </div>
  </body>
</html>
`;
}

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
    { loc: `${SITE_ORIGIN}${base}resume/`, lastmod: today, priority: '0.6' },
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
  const { journalEntriesData, projectsData, techSkillsData, warriorDetails } =
    await server.ssrLoadModule('/src/data/portfolioData.ts');
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

  if (techSkillsData?.length && warriorDetails) {
    const dir = path.join(dist, 'resume');
    await mkdir(dir, { recursive: true });
    await writeFile(
      path.join(dir, 'index.html'),
      resumePage(
        { skills: techSkillsData, projects: projectsData ?? [], details: warriorDetails },
        base
      )
    );
    console.log(`  resume/  skills-based resume for ${warriorDetails.name}`);
  }

  await writeFile(path.join(dist, 'robots.txt'), robotsTxt());
  await writeFile(path.join(dist, '404.html'), notFoundPage(base));
  console.log(`  404.html  static-host not-found page -> dist/`);
  await writeFile(
    path.join(dist, 'sitemap.xml'),
    sitemapXml(base, journalEntriesData, projectsData)
  );

  console.log(`\n${journalEntriesData.length} article pages + journal index -> dist/journal/`);
  console.log(`sitemap.xml + robots.txt (Disallow: /) -> dist/`);
} finally {
  await server.close();
}
