import { defineConfig, devices } from '@playwright/test';
import { EnvConfig } from './src/config/env.config';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : EnvConfig.execution.retries,
  workers: process.env.CI ? 4 : EnvConfig.execution.workers,
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'reports/playwright-results.json' }],
    ['junit', { outputFile: 'reports/junit-results.xml' }],
    ['./src/utils/custom-reporter.ts'],
  ],
  use: {
    baseURL: EnvConfig.baseUrl,
    headless: EnvConfig.execution.headless,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium-enterprise',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
});

