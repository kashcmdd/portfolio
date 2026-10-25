import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * Serious and critical violations fail the run; everything below that is left
 * for a human because the darkened glass surfaces legitimately produce
 * borderline contrast that axe cannot judge without the video underneath.
 */
test('home page has no serious or critical accessibility violations', async ({ page }) => {
  await page.goto('./');
  await page
    .locator('[aria-label="Enter the portfolio"]')
    .waitFor({ state: 'detached', timeout: 10_000 });

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  const blocking = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  );

  expect(
    blocking.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.length,
    })),
  ).toEqual([]);
});
