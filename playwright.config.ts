import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:4173',
    browserName: 'chromium',
    headless: true,
  },
  webServer: {
    command: 'npm run build && npm run preview -- --host 0.0.0.0 --port 4173 --strictPort',
    url: 'http://localhost:4173/login',
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
