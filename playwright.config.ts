import { defineConfig, devices } from 'playwright/test';

export default defineConfig({
  testDir: './src/__tests__',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'https://d235c6bkn2rd4.ok.kimi.link',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
