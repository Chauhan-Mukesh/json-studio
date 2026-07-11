import { defineConfig, devices } from '@playwright/test';

/**
 * Serves the folder with python http.server so file:// quirks (fetch(),
 * clipboard, downloads) all behave like a normal https-ish origin.
 * Tests navigate to http://localhost:8765/json-studio.html
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 30_000,
  expect: { timeout: 5_000 },

  use: {
    baseURL: 'http://localhost:8765',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 5_000,
    navigationTimeout: 10_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'python3 -m http.server 8765',
    port: 8765,
    reuseExistingServer: !process.env.CI,
    timeout: 10_000,
  },
});
