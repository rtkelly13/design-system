import { defineConfig, devices } from '@playwright/test';

/**
 * Config for the screenshot walkthrough (`tests/walkthrough.spec.ts`).
 *
 * Separate from `playwright.config.ts` on purpose. That one is a pass/fail
 * gate with pixel baselines and CI retries; this one asserts nothing and just
 * produces a reviewable artifact. Sharing a config would mean either the
 * walkthrough inherits snapshot machinery it has no use for, or the visual
 * suite loosens to accommodate it.
 *
 * Unlike the visual suite this is not pinned to Linux — screenshots are for
 * human review, so platform font differences are cosmetic rather than a
 * correctness problem.
 */
export default defineConfig({
  testDir: './tests',
  testMatch: /walkthrough\.spec\.ts$/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Nothing is asserted, so a retry cannot turn a failure into a pass — it can
  // only paper over a flaky page load, which is exactly what we want here.
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  outputDir: 'walkthrough/.playwright',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:6006',
    viewport: { width: 1440, height: 900 },
    // Fixed DPR keeps the sheet's file sizes predictable across machines.
    deviceScaleFactor: 1,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: 'npx serve storybook-static -p 6006 --config ../serve.json',
    url: 'http://localhost:6006',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
