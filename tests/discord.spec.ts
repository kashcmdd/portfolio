import { expect, test } from '@playwright/test';

const presence = {
  success: true,
  data: {
    discord_user: {
      id: '1415420243836407878',
      username: 'kashhcmd',
      global_name: 'KashhCMD',
      avatar: null,
    },
    discord_status: 'online',
    activities: [{ name: 'Visual Studio Code', type: 0 }],
    listening_to_spotify: false,
    spotify: null,
  },
};

test('makes no request until the visitor asks', async ({ page }) => {
  let requests = 0;
  await page.route('**/api.lanyard.rest/**', async (route) => {
    requests += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(presence),
    });
  });

  await page.goto('./');
  await page
    .locator('[aria-label="Enter the portfolio"]')
    .waitFor({ state: 'detached', timeout: 15_000 });

  const button = page.getByRole('button', { name: 'Show Discord status' });
  await button.scrollIntoViewIfNeeded();
  await expect(button).toBeVisible();
  expect(requests).toBe(0);

  await button.click();
  await expect(page.getByText('Online')).toBeVisible();
  await expect(page.getByText('· Playing Visual Studio Code')).toBeVisible();
  expect(requests).toBe(1);
});

test('explains when Lanyard is not monitoring the account', async ({ page }) => {
  await page.route('**/api.lanyard.rest/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: false, error: { message: 'User not monitored' } }),
    });
  });

  await page.goto('./');
  await page
    .locator('[aria-label="Enter the portfolio"]')
    .waitFor({ state: 'detached', timeout: 15_000 });

  const button = page.getByRole('button', { name: 'Show Discord status' });
  await button.scrollIntoViewIfNeeded();
  await button.click();

  await expect(page.getByText(/isn't available right now/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
});
