import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 30000,
  workers: 1, // Run tests sequentially to avoid rate-limiting issues
  use: {
    headless: true,                 // Show browser for debugging
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
  reporter: [['list'], ['html']],

});
