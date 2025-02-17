import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  tsconfig: 'tsconfig.json',
  timeout: 150000, // Global test timeout (30 seconds)
  workers: 4, // Use exactly 2 workers globally
  fullyParallel: true, // Run tests within files in parallel
  use: {
    headless: false,
    viewport: null,
    launchOptions: {
      args: ['--start-maximized']
    },
  },
});
