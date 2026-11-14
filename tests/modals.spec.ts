import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const openLanding = async (page: Page) => {
  await page.goto('./');
  await page
    .locator('[aria-label="Enter the portfolio"]')
    .waitFor({ state: 'detached', timeout: 15_000 });
};

const expectNoBlocking = async (page: Page) => {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
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
};

/**
 * Axe was only ever pointed at the landing page. The dialogs are where the
 * densest forms, tabs and cards live, and they exist only while open, so they
 * need their own pass.
 */
test('project dialog', async ({ page }) => {
  await openLanding(page);
  await page.locator('#work [role="button"]').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expectNoBlocking(page);
});

test('journal dialog', async ({ page }) => {
  await openLanding(page);
  await page.getByRole('button', { name: /Read journal entry:/ }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expectNoBlocking(page);
});

test('contact dialog', async ({ page }) => {
  await openLanding(page);
  await page.getByRole('banner').getByRole('button', { name: 'Contact' }).click();
  await expect(page.getByRole('dialog', { name: 'Get in touch' })).toBeVisible();
  await expectNoBlocking(page);
});

test('search dialog', async ({ page }) => {
  await openLanding(page);
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByRole('dialog', { name: 'Search and commands' })).toBeVisible();
  await expectNoBlocking(page);
});
