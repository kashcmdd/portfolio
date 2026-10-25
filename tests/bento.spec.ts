import { expect, test } from '@playwright/test';

/**
 * Every child of the featured works grid must sit in a row that adds up to the
 * full twelve columns. This is the regression that shipped once already: the
 * spans summed to 41, the last card sat in a five-wide hole and nothing in
 * `tsc` or the static-output check could see it.
 *
 * The intended rhythm is asserted as well as the geometry, because a data edit
 * can keep the rows full while quietly changing the layout the copy describes.
 */
const EXPECTED_SPANS = ['span 12', 'span 7', 'span 5', 'span 5', 'span 7', 'span 12'];

test('featured works tile the twelve-column grid without holes', async ({ page }) => {
  await page.goto('./');
  await page
    .locator('[aria-label="Enter the portfolio"]')
    .waitFor({ state: 'detached', timeout: 10_000 });

  const cards = page.locator('#work .grid > *');
  await expect(cards).toHaveCount(EXPECTED_SPANS.length);

  const spans = await cards.evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).gridColumnStart),
  );
  expect(spans).toEqual(EXPECTED_SPANS);

  const grid = await page.locator('#work .grid').evaluate((element) => {
    const style = getComputedStyle(element);
    const gap = Number.parseFloat(style.columnGap);
    const rows = new Map<number, number[]>();

    for (const child of Array.from(element.children)) {
      const rect = child.getBoundingClientRect();
      const top = Math.round(rect.top);
      rows.set(top, [...(rows.get(top) ?? []), rect.width]);
    }

    return {
      width: element.getBoundingClientRect().width,
      gap,
      rows: [...rows.values()].map((widths) => ({
        columns: widths.length,
        filled: widths.reduce((total, width) => total + width, 0) + gap * (widths.length - 1),
      })),
    };
  });

  // 12 / 7+5 / 5+7 / 12: one full-width bookend, two paired rows, one bookend.
  expect(grid.rows.map((row) => row.columns)).toEqual([1, 2, 2, 1]);
  for (const row of grid.rows) {
    // Sub-pixel rounding is expected; a missing span is tens of pixels.
    expect(Math.abs(row.filled - grid.width)).toBeLessThanOrEqual(1.5);
  }

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
