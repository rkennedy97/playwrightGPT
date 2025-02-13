import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  tsconfig: 'tsconfig.json',
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
