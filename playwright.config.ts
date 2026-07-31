import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.spec\.ts$/,
  snapshotPathTemplate: '{testDir}/__snapshots__/{testFilePath}/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'html' : [['list'], ['html', { open: 'never' }]],
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05,
      threshold: 0.2,
    },
  },
  use: {
    baseURL: 'http://localhost:6006',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // NOT `serve`: it has clean-URLs on by default, which 301s
    // `/iframe.html?id=foundations-button--default` to `/iframe` and drops the
    // query string. Storybook then has no story to select and every test
    // screenshots the same "No Preview" error page — silently, because the
    // baselines get generated from that same page. `vite preview` serves the
    // static build verbatim, and vite is already a devDependency here.
    command:
      'npx vite preview --outDir storybook-static --port 6006 --strictPort',
    url: 'http://localhost:6006/iframe.html',
    reuseExistingServer: !process.env.CI,
  },
});
