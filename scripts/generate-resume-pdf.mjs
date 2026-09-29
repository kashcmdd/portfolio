/**
 * Writes a real, downloadable PDF resume into dist/.
 *
 * The /resume/ page can already be saved as a PDF through the browser's print
 * dialog, but that needs a browser, a print dialog and a "Save as PDF"
 * destination. A recruiter who clicks "download" expects a file to arrive.
 *
 * There is no PDF library here on purpose. Helvetica is one of the fourteen
 * base fonts every reader ships, so a resume needs no embedded font data, and
 * the layout is a single column of text — no images, no tables, no vector art.
 * That is small enough to write by hand and keeps the build dependency-free.
 * The document is plain ASCII: content is transliterated rather than relying on
 * a Unicode encoding the base fonts do not carry.
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
    .replace(/\u2026/g, '...')
    .replace(/\u00B7/g, '-')
    .replace(/[^\x20-\x7E]/g, '');

const pdfString = (value) =>
  ascii(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

// Greedy wrap. Text is monospaced only in the sense that we estimate width:
// Helvetica averages a little under half an em per character, so maxChars is
// chosen conservatively against the 504pt text column.
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

// ---- page model -----------------------------------------------------------

const ACCENT = [0.537, 0.667, 0.8];
const INK = [0.09, 0.09, 0.09];
const MUTED = [0.42, 0.42, 0.42];

const FONTS = { regular: 'F1', bold: 'F2', italic: 'F3' };

// Each entry is one baseline. `gap` adds blank baselines before it, which is how
// section spacing works now that every line shares one leading.
const line = (text, { font = 'regular', size = 10, color = INK, gap = 0 } = {}) => ({
  text,
  font,
  size,
  color,
  gap,
});

const buildLines = ({ details, skills, projects }) => {
  const out = [];

  out.push(line(details.name, { font: 'bold', size: 22 }));
  out.push(line(details.title, { size: 12, color: MUTED, gap: 0 }));
  out.push(line(`github.com/${details.githubHandle}`, { size: 10, color: MUTED }));

  out.push(line('SUMMARY', { font: 'bold', size: 11, color: ACCENT, gap: 3 }));
  wrap(details.bio, 96).forEach((text) => out.push(line(text)));

  out.push(line('APPROACH', { font: 'bold', size: 11, color: ACCENT, gap: 3 }));
  wrap(details.philosophy, 96).forEach((text) => out.push(line(text)));

  out.push(line('SKILLS', { font: 'bold', size: 11, color: ACCENT, gap: 3 }));
  const categories = Array.from(new Set(skills.map((skill) => skill.category)));
  for (const category of categories) {
    const items = skills
      .filter((skill) => skill.category === category)
      .map((skill) => `${skill.name} (${skill.level})`)
      .join('  |  ');
    out.push(line(category, { font: 'bold', size: 10, gap: 1 }));
    wrap(items, 96).forEach((text) => out.push(line(text, { size: 10 })));
  }

  out.push(line('SELECTED PROJECTS', { font: 'bold', size: 11, color: ACCENT, gap: 3 }));
  for (const project of projects) {
    out.push(line(`${project.title} - ${project.category}`, { font: 'bold', size: 11, gap: 2 }));
    if (project.outcome) {
      wrap(project.outcome, 96).forEach((text) => out.push(line(text, { font: 'italic' })));
    } else {
      wrap(project.subtitle, 96).forEach((text) => out.push(line(text, { font: 'italic' })));
    }
    wrap(project.tags.join(' · '), 100).forEach((text) =>
      out.push(line(text, { size: 9, color: MUTED }))
    );
    const links = [project.githubUrl, project.liveUrl].filter(Boolean).map(ascii);
    if (links.length) out.push(line(links.join('   '), { size: 9, color: ACCENT }));
  }

  out.push(
    line(`Generated from ${SITE_ORIGIN}/`, { size: 8.5, color: MUTED, gap: 3 })
  );

  return out;
};

// ---- PDF writer -----------------------------------------------------------

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 54;
const LEADING = 14;
const TOP = PAGE_HEIGHT - MARGIN;
const LINES_PER_PAGE = 46;

const rgb = ([r, g, b]) =>
  `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg`;

const contentStream = (lines) => {
  const parts = ['BT', `1 0 0 1 ${MARGIN} ${TOP} Tm`, `${LEADING} TL`];
  for (const item of lines) {
    for (let i = 0; i < item.gap; i += 1) parts.push('T*');
    parts.push(`/${item.font} ${item.size} Tf`);
    parts.push(rgb(item.color));
    parts.push(`(${pdfString(item.text)}) Tj`);
    parts.push('T*');
  }
  parts.push('ET');
  return parts.join('\n');
};

const paginate = (lines) => {
  const pages = [];
  for (let i = 0; i < lines.length; i += LINES_PER_PAGE) {
    pages.push(lines.slice(i, i + LINES_PER_PAGE));
  }
  return pages.length ? pages : [[]];
};

const buildPdf = (lines) => {
  const pages = paginate(lines);
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

  pages.forEach((pageLines, index) => {
    const stream = contentStream(pageLines);
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

  const lines = buildLines({
    details: warriorDetails,
    skills: techSkillsData ?? [],
    projects: projectsData ?? [],
  });
  const pdf = buildPdf(lines);

  const dist = path.join(root, 'dist');
  await mkdir(dist, { recursive: true });
  await writeFile(path.join(dist, 'KashhCMD-Resume.pdf'), pdf);

  const pages = paginate(lines).length;
  console.log(`  KashhCMD-Resume.pdf  ${pages} page(s), ${pdf.length} bytes -> dist/`);
} finally {
  await server.close();
}
