import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * The skill copy is long on purpose, so phones get a three-line clamp with a
 * Read more toggle while desktop keeps the full paragraph. Both halves of that
 * contract are asserted here.
 */
test.use({ viewport: { width: 390, height: 844 } });

const waitForIntro = async (page: Page) => {
  await page.goto('./');
  await page
    .locator('[aria-label="Enter the portfolio"]')
    .waitFor({ state: 'detached', timeout: 15_000 });
};

const lineClamp = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((element) => getComputedStyle(element).getPropertyValue('-webkit-line-clamp'));

test('clamps the body to three lines and expands on tap', async ({ page }) => {
  await waitForIntro(page);

  // Target the control by the id it owns: after the click its accessible name
  // changes to "Show less", so a name-based locator would re-resolve to the
  // next collapsed card.
  const toggle = page.locator('button[aria-controls="skill-fullstack-web-body"]');
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');

  const body = page.locator('#skill-fullstack-web-body');
  expect(await lineClamp(page, '#skill-fullstack-web-body')).toBe('3');

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(toggle).toHaveText(/Show less/);
  expect(await lineClamp(page, '#skill-fullstack-web-body')).toBe('none');
  await expect(body).toBeVisible();
});

test('desktop is unclamped and hides the toggle', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await waitForIntro(page);

  expect(await lineClamp(page, '#skills [id$="-body"]')).toBe('none');
  // The toggles still exist in the DOM so a rotation from a phone keeps the
  // state, but the md:hidden rule removes them from the desktop view.
  expect(await page.locator('button[aria-controls$="-body"]').count()).toBe(8);
  await expect(page.locator('button[aria-controls="skill-fullstack-web-body"]')).toBeHidden();
});
