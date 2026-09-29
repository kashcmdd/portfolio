/**
 * Writes a real, downloadable PDF resume into dist/.
 *
 * The /resume/ page can already be saved as a PDF through the browser's print
 * dialog, but that needs a browser, a print dialog and a "Save as PDF"
 * destination. A recruiter who clicks "download" expects a file to arrive.
 *
 * The preferred path drives headless Chromium (Chrome or Edge) to print that
 * same page, so the PDF carries the real Inter and Instrument Serif faces and
 * the print stylesheet's layout. When no browser is available — a CI image,
 * say — it falls back to the hand-written document below: Helvetica is one of
 * the fourteen base fonts every reader ships, so that one embeds nothing and is
 * transliterated to plain ASCII rather than relying on an encoding the base
 * fonts do not carry. The fallback is plainer, but it always builds.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { cpSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createServer } from 'vite';
import { requireBase } from './lib/journal-blocks.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE_ORIGIN = 'https://kashcmdd.github.io';

// ---- text helpers ---------------------------------------------------------

// The base fonts are WinAnsi, so a raw em dash or curly quote would arrive as
// mojibake. Fold the punctuation we actually use down to ASCII and drop the
// rest; a resume is not the place to discover a font encoding gap.
const ascii = (value) =>
  String(value ?? '')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E]/g, '"')
    .replace(/\u2014|\u2013|\u2012/g, '-')
    .replace(/\u2022/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00B7/g, '-')
    .replace(/[^\x20-\x7E]/g, '');

const pdfString = (value) =>
  ascii(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

// Helvetica advance widths in units per 1000. Wrapping by measured width is
// exact, where a character count was a guess that broke as soon as a line held
// more wide letters than the estimate assumed.
const WIDTHS = {
  ' ': 278, '!': 278, '"': 355, '#': 556, '$': 556, '%': 889, '&': 667, "'": 191,
  '(': 333, ')': 333, '*': 389, '+': 584, ',': 278, '-': 333, '.': 278, '/': 278,
  ':': 278, ';': 278, '<': 584, '=': 584, '>': 584, '?': 556, '@': 1015,
  '[': 278, '\\': 278, ']': 278, '^': 469, '_': 556, '`': 333,
  '{': 334, '|': 260, '}': 334, '~': 584,
  A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 500,
  K: 667, L: 556, M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722, S: 667, T: 611,
  U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
  a: 556, b: 556, c: 500, d: 556, e: 556, f: 278, g: 556, h: 556, i: 222, j: 222,
  k: 500, l: 222, m: 833, n: 556, o: 556, p: 556, q: 556, r: 333, s: 500, t: 278,
  u: 556, v: 500, w: 722, x: 500, y: 500, z: 500,
};
for (let digit = 0; digit <= 9; digit += 1) WIDTHS[String(digit)] = 556;

const measure = (value, size) => {
  let total = 0;
  for (const ch of ascii(value)) total += ((WIDTHS[ch] ?? 556) / 1000) * size;
  return total;
};

// Greedy wrap against the real point width of the column.
const wrap = (value, maxWidth, size = 10) => {
  const words = ascii(value).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && measure(candidate, size) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
};

// ---- palette and geometry -------------------------------------------------

const ACCENT = [0.145, 0.353, 0.533];
const INK = [0.09, 0.09, 0.09];
const MUTED = [0.42, 0.42, 0.42];
const RULE = [0.82, 0.82, 0.82];

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 54;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const TOP = PAGE_HEIGHT - MARGIN;
const BOTTOM = 60;
const LEADING = 14;
const SKILLS_RIGHT_X = MARGIN + 104;
const SKILLS_RIGHT_WIDTH = PAGE_WIDTH - MARGIN - SKILLS_RIGHT_X;

const FONTS = { regular: 'F1', bold: 'F2', italic: 'F3' };

// ---- document writer ------------------------------------------------------

// A page is a list of drawing operations in absolute page coordinates. The
// writer owns a single descending cursor; anything that needs two things side
// by side computes its own x and shares the cursor's y.
class Resume {
  constructor() {
    this.pages = [];
    this.startPage();
  }

  startPage() {
    this.items = [];
    this.pages.push(this.items);
    this.y = TOP;
  }

  newPage() {
    this.startPage();
  }

  ensure(space) {
    if (this.y - space < BOTTOM) this.newPage();
  }

  text(value, { x = MARGIN, y = this.y, size = 10, font = 'regular', color = INK } = {}) {
    this.items.push({ type: 'text', x, y, size, font, color, text: value });
  }

  rule({ x = MARGIN, width = CONTENT_WIDTH, thickness = 0.7, color = RULE } = {}) {
    this.items.push({ type: 'rule', x, y: this.y, width, thickness, color });
  }

  space(amount) {
    this.y -= amount;
  }

  // A paragraph breaks across pages rather than overflowing the bottom margin.
  paragraph(value, { maxWidth = CONTENT_WIDTH, size = 10, font = 'regular', color = INK } = {}) {
    for (const lineText of wrap(value, maxWidth, size)) {
      if (this.y - LEADING < BOTTOM) this.newPage();
      this.text(lineText, { size, font, color });
      this.space(LEADING);
    }
  }

  heading(value) {
    this.ensure(46);
    this.space(12);
    this.text(ascii(value).toUpperCase(), { size: 10.5, font: 'bold', color: ACCENT });
    this.space(14);
    this.rule({ y: this.y + 3, thickness: 0.7 });
    this.space(8);
  }

  // Two columns a row at a time, so a long skill list stays beside its category
  // instead of doubling the block's height.
  skillRow(category, items) {
    const rightLines = wrap(items, SKILLS_RIGHT_WIDTH, 10);
    const height = Math.max(1, rightLines.length) * LEADING;
    this.ensure(height + 4);
    const startY = this.y;
    this.text(category, { x: MARGIN, y: startY, size: 10, font: 'bold' });
    rightLines.forEach((lineText, index) => {
      this.text(lineText, { x: SKILLS_RIGHT_X, y: startY - index * LEADING, size: 10 });
    });
    this.space(height + 2);
  }
}

const rgb = ([r, g, b]) => `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg`;

const contentStream = (items) => {
  const parts = [];
  for (const item of items) {
    if (item.type === 'rule') {
      parts.push(rgb(item.color));
      parts.push(`${item.x} ${item.y} ${item.width} ${item.thickness} re f`);
    } else {
      parts.push(rgb(item.color));
      parts.push('BT');
      parts.push(`/${item.font} ${item.size} Tf`);
      parts.push(`1 0 0 1 ${item.x} ${item.y} Tm`);
      parts.push(`(${pdfString(item.text)}) Tj`);
      parts.push('ET');
    }
  }
  return parts.join('\n');
};

// ---- document content -----------------------------------------------------

const buildResume = ({ details, skills, projects }) => {
  const doc = new Resume();

  doc.text(details.name, { size: 25, font: 'bold' });
  doc.space(27);
  doc.text(details.title, { size: 12.5, color: ACCENT });
  doc.space(15);
  doc.text(`github.com/${details.githubHandle}  |  ${SITE_ORIGIN}/`, {
    size: 9.5,
    color: MUTED,
  });
  doc.space(10);
  doc.rule({ y: doc.y, thickness: 1.6, color: ACCENT });
  doc.space(6);

  doc.heading('Summary');
  doc.paragraph(details.bio);

  doc.heading('Approach');
  doc.paragraph(details.philosophy);

  doc.heading('Skills');
  const categories = Array.from(new Set(skills.map((skill) => skill.category)));
  for (const category of categories) {
    const items = skills
      .filter((skill) => skill.category === category)
      .map((skill) => `${skill.name} (${skill.level})`)
      .join('  |  ');
    doc.skillRow(category, items);
  }

  doc.heading('Selected Projects');
  projects.forEach((project, index) => {
    if (index > 0) doc.space(4);
    // Measure the whole entry before drawing it, so a page break lands between
    // projects instead of halfway through one.
    const outcomeLines = wrap(project.outcome || project.subtitle, CONTENT_WIDTH, 10).length;
    const tagLines = wrap(project.tags.join('  |  '), CONTENT_WIDTH, 9).length;
    const linkLines = project.githubUrl || project.liveUrl ? 1 : 0;
    doc.ensure(14 + (outcomeLines + tagLines + linkLines) * LEADING);

    doc.text(`${project.title}  -  ${project.category}`, { size: 11, font: 'bold' });
    doc.space(14);
    doc.paragraph(project.outcome || project.subtitle, {
      font: 'italic',
      color: [0.28, 0.28, 0.28],
    });
    doc.paragraph(project.tags.join('  |  '), { size: 9, color: MUTED });
    const links = [project.githubUrl, project.liveUrl].filter(Boolean).map(ascii);
    if (links.length) doc.paragraph(links.join('    '), { size: 9, color: ACCENT });
  });

  // Footer on every page, drawn last so it never competes with content.
  doc.pages.forEach((items, index) => {
    items.push({ type: 'rule', x: MARGIN, y: 46, width: CONTENT_WIDTH, thickness: 0.5, color: RULE });
    items.push({
      type: 'text',
      x: MARGIN,
      y: 34,
      size: 8,
      font: 'regular',
      color: MUTED,
      text: `${details.name} - ${details.title}`,
    });
    const label = `Page ${index + 1} of ${doc.pages.length}`;
    items.push({
      type: 'text',
      x: PAGE_WIDTH - MARGIN - measure(label, 8),
      y: 34,
      size: 8,
      font: 'regular',
      color: MUTED,
      text: label,
    });
  });

  return doc.pages;
};

// ---- PDF file assembly ----------------------------------------------------

const buildPdf = (pages) => {
  // Objects 1-5 are fixed (catalog, pages, three fonts); each page then owns a
  // page object and a content-stream object, numbered in pairs from 6.
  const pageObjects = pages.map((_, index) => 6 + index * 2);
  const contentObjects = pages.map((_, index) => 7 + index * 2);

  const objects = [];
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[2] =
    `<< /Type /Pages /Kids [${pageObjects.map((n) => `${n} 0 R`).join(' ')}] ` +
    `/Count ${pages.length} >>`;
  objects[3] =
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
  objects[4] =
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
  objects[5] =
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>';

  pages.forEach((items, index) => {
    const stream = contentStream(items);
    const length = Buffer.byteLength(stream, 'latin1');
    objects[pageObjects[index]] =
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] ' +
      '/Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> ' +
      `/Contents ${contentObjects[index]} 0 R >>`;
    objects[contentObjects[index]] =
      `<< /Length ${length} >>\nstream\n${stream}\nendstream`;
  });

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  for (let i = 1; i < objects.length; i += 1) {
    offsets[i] = Buffer.byteLength(pdf, 'latin1');
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefStart = Buffer.byteLength(pdf, 'latin1');
  const size = objects.length; // highest object number + 1
  pdf += `xref\n0 ${size}\n0000000000 65535 f \n`;
  for (let i = 1; i < size; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${size} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return Buffer.from(pdf, 'latin1');
};

// ---- browser printing -----------------------------------------------------
// Chromium prints the generated /resume/ page straight to PDF, embedding the
// same Inter and Instrument Serif the page uses. The fallback below draws the
// document by hand, which is plainer but needs nothing installed.

const BROWSER_CANDIDATES = [
  process.env.RESUME_PDF_BROWSER,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/microsoft-edge',
  '/snap/bin/chromium',
].filter(Boolean);

const findBrowser = () =>
  BROWSER_CANDIDATES.find((candidate) => existsSync(candidate)) ?? null;

const printWithBrowser = (browser, htmlPath, outPath) =>
  new Promise((resolve, reject) => {
    if (existsSync(outPath)) rmSync(outPath);
    const userDataDir = mkdtempSync(path.join(tmpdir(), 'resume-pdf-'));
    const finish = (error) => {
      try {
        rmSync(userDataDir, { recursive: true, force: true });
      } catch {
        /* best effort; a leftover temp profile is harmless */
      }
      if (error) reject(error);
      else resolve();
    };
    const child = spawn(
      browser,
      [
        '--headless=new',
        '--disable-gpu',
        '--hide-scrollbars',
        '--no-pdf-header-footer',
        // Give the webfonts time to finish loading before the page is frozen.
        '--virtual-time-budget=6000',
        `--user-data-dir=${userDataDir}`,
        `--print-to-pdf=${outPath}`,
        pathToFileURL(htmlPath).href,
      ],
      { stdio: 'ignore' }
    );
    child.on('error', (error) => finish(error));
    child.on('exit', (code) => {
      if (code === 0 && existsSync(outPath)) finish();
      else finish(new Error(`browser exited with code ${code}`));
    });
  });

// ---- run ------------------------------------------------------------------

const dist = path.join(root, 'dist');
const pdfPath = path.join(dist, 'KashhCMD-Resume.pdf');
const htmlPath = path.join(dist, 'resume', 'index.html');

await mkdir(dist, { recursive: true });

const browser = findBrowser();
let printed = false;
if (browser && existsSync(htmlPath)) {
  // The page loads its fonts relative to /resume/. A build has already copied
  // public/ into dist/, but the dev middleware generates the page without that
  // copy, so make sure the fonts are beside it before the file:// load.
  const distFonts = path.join(dist, 'fonts');
  if (!existsSync(distFonts)) {
    cpSync(path.join(root, 'public', 'fonts'), distFonts, { recursive: true });
  }
  try {
    await printWithBrowser(browser, htmlPath, pdfPath);
    printed = true;
    console.log(
      `  KashhCMD-Resume.pdf  printed from /resume/ with ${path.basename(browser)} -> dist/`
    );
  } catch (error) {
    console.warn(`  resume PDF: browser print unavailable (${error.message})`);
  }
}

if (!printed) {
  const server = await createServer({
    root,
    configFile: path.join(root, 'vite.config.ts'),
    server: { middlewareMode: true, hmr: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
    appType: 'custom',
    logLevel: 'error',
  });

  try {
    const { techSkillsData, projectsData, warriorDetails } = await server.ssrLoadModule(
      '/src/data/portfolioData.ts'
    );
    requireBase(server.config, 'generate-resume-pdf');

    const pages = buildResume({
      details: warriorDetails,
      skills: techSkillsData ?? [],
      projects: projectsData ?? [],
    });
    const pdf = buildPdf(pages);
    await writeFile(pdfPath, pdf);
    console.log(
      `  KashhCMD-Resume.pdf  ${pages.length} page(s), ${pdf.length} bytes (fallback) -> dist/`
    );
  } finally {
    await server.close();
  }
}
