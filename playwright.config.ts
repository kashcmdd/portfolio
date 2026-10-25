import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

/**
 * Layout and accessibility checks run against the built site, served by
 * `vite preview` at the same `/portfolio/` base path GitHub Pages uses. The
 * tests only read `dist/`, so `npm run build` has to have run first; the QA
 * workflow does that explicitly before calling Playwright.
 *
 * Desktop gets the full suite; the mobile project only runs the axe scan,
 * because the bento spans collapse to a single column below `md`.
 *
 * Playwright's bundled headless shell needs a full set of system libraries that
 * some Linux development machines do not have. Where the snap Chromium exists,
 * use it for local runs; CI installs the bundled browser with `--with-deps`.
 * `PLAYWRIGHT_CHROMIUM_PATH` overrides the choice everywhere.
 */
const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}/portfolio/`;

const localChromium =
  process.env.PLAYWRIGHT_CHROMIUM_PATH ??
  (!process.env.CI && existsSync('/snap/bin/chromium') ? '/snap/bin/chromium' : undefined);

export default defineConfig({
  testDir: './tests',
  // Three tests against one preview server. Serial avoids several snap
  // Chromium instances competing at startup, and the suite is small enough
  // that parallelism buys nothing.
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    ...(localChromium ? { launchOptions: { executablePath: localChromium } } : {}),
  },
  webServer: {
    command: `npm run preview -- --port ${PORT} --strictPort --host 127.0.0.1`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'], browserName: 'chromium' },
      testMatch: /a11y\.spec\.ts/,
    },
  ],
});
