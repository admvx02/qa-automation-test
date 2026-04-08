import { defineConfig } from '@playwright/test';

/**
 * Playwright Configuration for API Testing
 * Base URL: https://jsonplaceholder.typicode.com
 */
export default defineConfig({
  // Directory where tests are located
  testDir: './tests',

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Number of workers on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],

  // Global test timeout
  timeout: 30_000,

  // Shared settings for all tests
  use: {
    // Base URL for all API requests
    baseURL: 'https://jsonplaceholder.typicode.com',

    // Extra HTTP headers sent with every request
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },

    // Collect trace on first retry (useful for debugging)
    trace: 'on-first-retry',
  },
});
