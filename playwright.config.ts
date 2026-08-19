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
      // No pixel allowance.
      //
      // Rendering is pinned to one Chromium build on one OS, so the honest
      // expectation is an identical screenshot. The previous
      // `maxDiffPixelRatio: 0.05` let 5% of the image differ freely — about
      // 46,000 pixels of a 1280x720 shot, a region roughly 215x215, and
      // proportionally more on the `fullPage` rows. A component could change
      // colour, or a badge disappear, and the required check would pass. That
      // number was set when all five baselines were the same placeholder error
      // page, so it was never exercised against an image that could change.
      //
      // An absolute count rather than a ratio: it means the same thing on a
      // 1280x720 shot and a five-screen `fullPage` one, where a ratio silently
      // grants the tall images a much larger budget — exactly backwards, since
      // the big compositions are where a small regression hides.
      //
      // `threshold` is deliberately absent rather than written out as its
      // default of 0.2. A default restated in config reads as a tuned value and
      // invites tuning. It still applies, absorbing sub-pixel anti-aliasing
      // noise; tightening it is a separate change worth measuring on its own.
      maxDiffPixels: 0,
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
    command: 'npx serve storybook-static -p 6006 --config ../serve.json',
    url: 'http://localhost:6006',
    reuseExistingServer: !process.env.CI,
  },
});
