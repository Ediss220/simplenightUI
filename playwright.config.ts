import { defineConfig, devices } from '@playwright/test';
import { envConfig } from './src/config/env';
import { LOCALE } from './src/config/locale';

export default defineConfig({
  testDir: './tests',
  timeout: 180_000, // heavy async SPA + interactive Google Map zooming
  expect: { timeout: 15_000 },
  fullyParallel: false,
  // Serial by default (one worker) to be polite to the shared staging
  // environment; parallel runs opt in via --workers or TEST_WORKERS.
  workers: process.env.TEST_WORKERS ? Number(process.env.TEST_WORKERS) : 1,
  retries: 1, // staging occasionally serves a non-hydrated page on first load
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: envConfig.baseUrl,
    locale: LOCALE,
    // Staging sits behind a CloudFront WAF that 403s headless fingerprints —
    // local runs must be headed. CI keeps headless (see README, WAF note).
    launchOptions: { headless: process.env.CI === 'true' },
    viewport: { width: 1920, height: 1080 },
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
