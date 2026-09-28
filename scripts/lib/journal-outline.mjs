/**
 * Article outline helpers: heading ids and a table of contents.
 *
 * This lives apart from journal-blocks.mjs on purpose. journal-blocks.mjs
 * imports Prism to highlight code, and the app imports these helpers eagerly to
 * build a table of contents. If they shared a module, opening a post would pull
 * the whole highlighter into the initial bundle to compute a few slugs.
 */

/**
 * Stable anchor id for a heading. Duplicate headings get a numeric suffix,
 * which matters as soon as an article has two sections called "Result".
 */
export function slugifyHeading(text, seen = new Set()) {
  const base =
    String(text)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'section';
  let slug = base;
  let n = 2;
  while (seen.has(slug)) {
    slug = `${base}-${n++}`;
  }
  seen.add(slug);
  return slug;
}

/**
 * One slug per block, aligned to the content array: the heading at index 3
 * gets index 3's value, everything else gets null. Walking the blocks once and
 * keeping the alignment means the rendered heading and the table of contents
 * cannot drift apart, because they are the same walk.
 */
export function outlineSlugs(blocks = []) {
  const seen = new Set();
  return blocks.map((block) =>
    block && block.type === 'heading' ? slugifyHeading(block.text, seen) : null
  );
}

/**
 * Headings in document order, paired with the same ids outlineSlugs emits, so
 * a table of contents built from this can only ever link to real headings.
 */
export function articleOutline(blocks = []) {
  const seen = new Set();
  return blocks
    .filter((block) => block && block.type === 'heading')
    .map((block) => ({ id: slugifyHeading(block.text, seen), text: block.text }));
}
