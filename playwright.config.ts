import { defineConfig, devices } from '@playwright/test';
import { envConfig } from './src/config/env';

export default defineConfig({
  testDir: './tests',
  timeout: 180_000, // heavy async SPA + interactive Google Map zooming
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1, // be polite to the shared staging environment
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: envConfig.baseUrl,
    locale: 'en-US',
    timezoneId: 'America/New_York',
    viewport: { width: 1920, height: 1080 },
    actionTimeout: 20_000,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
