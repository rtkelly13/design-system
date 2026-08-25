import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.spec\.ts$/,
  snapshotPathTemplate: '{testDir}/__snapshots__/{testFilePath}/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Four on CI, measured rather than picked. The suite is wait-bound, not
  // CPU-bound — 38 tests spend their time on page loads, `document.fonts.ready`
  // and the 300ms settle in `visual.spec.ts`, so one worker left three of the
  // runner's four cores idle for 36 seconds:
  //
  // | workers | wall clock |
  // |---|---|
  // | 1 | 36.8s |
  // | 2 | 17.7s |
  // | 4 | 11.5-12.5s |
  //
  // **Parallelism here is a claim about determinism, so it was tested as one.**
  // `maxDiffPixels: 0` means any rendering that varies with how busy the machine
  // is would show up as a failed pixel diff. Baselines were generated at one
  // worker and the suite re-run against them seven times at two, four and six
  // workers on a four-core Linux box: byte-identical every time. That is the
  // expected result and worth stating why — nothing screenshotted here depends
  // on wall-clock time. `animations: 'disabled'` finishes transitions rather
  // than waiting them out, `story-ready.ts` awaits `document.fonts.ready` and a
  // verified render before anything is captured, and the viewport is fixed. A
  // slower worker gets the same pixels, later.
  //
  // Four rather than six — six measured a further second, which is not worth
  // spending the per-test timeout headroom on a gate that blocks merges.
  //
  // If this ever does produce a diff that a re-run does not reproduce, the fix
  // is this line back to 1, and the finding belongs in the determinism contract
  // in `docs/visual-regression.md` — a real non-determinism found here is worth
  // more than the 24 seconds.
  workers: process.env.CI ? 4 : undefined,
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
