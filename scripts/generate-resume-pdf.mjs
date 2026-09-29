/**
 * Writes a real, downloadable PDF resume into dist/.
 *
 * The /resume/ page can already be saved as a PDF through the browser's print
 * dialog, but that needs a browser, a print dialog and a "Save as PDF"
 * destination. A recruiter who clicks "download" expects a file to arrive.
 *
 * There is no PDF library here on purpose. Helvetica is one of the fourteen
 * base fonts every reader ships, so a resume needs no embedded font data, and
 * the layout is a small column of text — no images, no tables, no vector art.
 * An accent header, rules under each section and a two-column skills block are
 * all drawn with the handful of operators the format has always had. The
 * document is plain ASCII: content is transliterated rather than relying on a
 * Unicode encoding the base fonts do not carry.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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

// Greedy wrap. Helvetica averages a little under half an em per character, so
// maxChars is chosen conservatively against the point width of the column.
const wrap = (value, maxChars) => {
  const words = ascii(value).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= maxChars) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
};

// Rough Helvetica advance width, used only to centre the short footer string.
const textWidth = (value, size) => ascii(value).length * size * 0.5;

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
const SKILLS_CHARS = 72;

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

  text(value, { x = MARGIN, size = 10, font = 'regular', color = INK } = {}) {
    this.items.push({ type: 'text', x, y: this.y, size, font, color, text: value });
  }

  rule({ x = MARGIN, width = CONTENT_WIDTH, thickness = 0.7, color = RULE } = {}) {
    this.items.push({ type: 'rule', x, y: this.y, width, thickness, color });
  }

  space(amount) {
    this.y -= amount;
  }

  // A paragraph breaks across pages rather than overflowing the bottom margin.
  paragraph(value, { maxChars = 96, size = 10, font = 'regular', color = INK } = {}) {
    for (const lineText of wrap(value, maxChars)) {
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
    const rightLines = wrap(items, SKILLS_CHARS);
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
    const outcomeLines = wrap(project.outcome || project.subtitle, 96).length;
    const tagLines = wrap(project.tags.join('  |  '), 100).length;
    const linkLines = project.githubUrl || project.liveUrl ? 1 : 0;
    doc.ensure(14 + (outcomeLines + tagLines + linkLines) * LEADING);

    doc.text(`${project.title}  -  ${project.category}`, { size: 11, font: 'bold' });
    doc.space(14);
    doc.paragraph(project.outcome || project.subtitle, {
      maxChars: 96,
      font: 'italic',
      color: [0.28, 0.28, 0.28],
    });
    doc.paragraph(project.tags.join('  |  '), { maxChars: 100, size: 9, color: MUTED });
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
      x: PAGE_WIDTH - MARGIN - textWidth(label, 8),
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

// ---- run ------------------------------------------------------------------

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

  const dist = path.join(root, 'dist');
  await mkdir(dist, { recursive: true });
  await writeFile(path.join(dist, 'KashhCMD-Resume.pdf'), pdf);

  console.log(`  KashhCMD-Resume.pdf  ${pages.length} page(s), ${pdf.length} bytes -> dist/`);
} finally {
  await server.close();
}
