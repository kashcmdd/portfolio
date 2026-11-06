import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * The full-screen menu is the only navigation on a phone, so it has to behave
 * like the dialogs it replaced: focus stays inside while it is open, Escape
 * closes it, and focus comes back to the button that opened it.
 */
test.use({ viewport: { width: 390, height: 844 } });

const openMenu = async (page: Page) => {
  await page.goto('./');
  await page
    .locator('[aria-label="Enter the portfolio"]')
    .waitFor({ state: 'detached', timeout: 15_000 });
  await page.getByRole('button', { name: 'Toggle Mobile Menu' }).click();
  const dialog = page.getByRole('dialog', { name: 'Navigation' });
  await expect(dialog).toBeVisible();
  return dialog;
};

test('traps focus, closes with Escape, and restores focus', async ({ page }) => {
  const dialog = await openMenu(page);

  await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('mobile-navigation');

  for (let i = 0; i < 16; i += 1) {
    await page.keyboard.press('Tab');
  }
  expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true);

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();

  const returnedTo = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
  expect(returnedTo).toBe('Toggle Mobile Menu');
});

test('menu has no serious or critical accessibility violations', async ({ page }) => {
  await openMenu(page);

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

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('still opens, traps focus and closes', async ({ page }) => {
    const dialog = await openMenu(page);
    await expect(dialog).toBeVisible();
    expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(
      true,
    );
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });
});
