import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:3000',
    browserName: 'chromium',
    headless: true,
  },
  webServer: {
    command: 'npm run dev -- --host 0.0.0.0 --port 3000 --strictPort',
    url: 'http://localhost:3000/login',
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
