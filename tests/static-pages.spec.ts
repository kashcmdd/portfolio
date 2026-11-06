import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/**
 * The landing page has its own axe test; these are the pages a crawler or a
 * recruiter can land on directly. They use a separate, inline stylesheet in the
 * generator, so passing on the React app says nothing about them.
 */
const ROUTES: Array<[string, string]> = [
  ['journal index', 'journal/'],
  ['journal article', 'journal/elo-decay/'],
  ['projects index', 'projects/'],
  ['project page', 'projects/nebula/'],
  ['resume', 'resume/'],
  ['uses', 'uses/'],
  ['privacy', 'privacy/'],
  ['not found', '404.html'],
];

for (const [name, route] of ROUTES) {
  test(`${name} has no serious or critical accessibility violations`, async ({ page }) => {
    await page.goto(route);

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
  });
}
