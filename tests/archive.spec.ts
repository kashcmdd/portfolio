import { expect, test } from '@playwright/test';

/**
 * The journal index and the media policy are both easy to regress silently:
 * an archive can lose its excerpts in a template edit, and one remote image
 * URL reintroduces a third-party request that the privacy page says is gone.
 */

test('journal index reads as an archive, not a list of links', async ({ page }) => {
  await page.goto('journal/');

  const entries = page.locator('.archive a');
  await expect(entries).toHaveCount(6);

  // Every entry already carries a subtitle and a category in the data; the
  // index is only useful if it actually renders them.
  const first = entries.first();
  await expect(first.locator('.entry-cat')).toHaveText('ALGORITHMS');
  await expect(first.locator('h2')).toHaveText('Your Ladder Needs to Forget');
  await expect(first.locator('p')).toContainText('Rating decay is the least interesting part');

  for (const entry of await entries.all()) {
    expect((await entry.locator('p').innerText()).trim().length).toBeGreaterThan(20);
    await expect(entry.locator('.entry-meta')).toContainText('MIN READ');
  }
});

test('journal index links to a feed that exists', async ({ page, request }) => {
  await page.goto('journal/');

  const feed = page.getByRole('link', { name: 'Subscribe via RSS' });
  await expect(feed).toHaveAttribute('href', '../rss.xml');

  const response = await request.get('rss.xml');
  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type']).toContain('xml');
});

test('the landing page references no remote images', async ({ page, baseURL }) => {
  await page.goto('');

  // Attribute-level check rather than a request log: lazy images below the fold
  // still carry their src, so this catches a remote URL even if it would never
  // have been fetched during the test.
  const sources = await page.locator('img').evaluateAll((images) =>
    images.map((image) => (image as HTMLImageElement).currentSrc || (image as HTMLImageElement).src)
  );

  const remote = sources.filter((src) => src && !src.startsWith(baseURL!));
  expect(remote).toEqual([]);
});
