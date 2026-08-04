import { expect, test } from '@playwright/test';

/**
 * Visual regression tests for @rtkelly/design-system.
 *
 * These tests run on Linux (CI environment) because Playwright screenshots
 * are platform-specific due to OS font rendering differences.
 *
 * To update snapshots:
 * 1. Run: pnpm test:visual:update
 * 2. Or trigger GitHub Actions workflow with update_snapshots enabled.
 */

// Skip visual tests on non-Linux platforms (local dev on macOS/Windows)
test.skip(process.platform !== 'linux', 'Visual tests run on Linux CI');

async function waitForStoryReady(page: import('@playwright/test').Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  // Fail loudly if the story did not actually mount. Without this the suite can
  // pass while testing nothing: if Storybook cannot resolve the story id it
  // renders a "No Preview" placeholder, and since `--update-snapshots` happily
  // bakes that placeholder into the baseline, every test then compares one error
  // page against another and goes green forever. That is exactly what a
  // clean-URLs static server did to this suite (see playwright.config.ts).
  const root = page.locator('#storybook-root');
  await expect(root).not.toContainText('No Preview');
  await expect(root).not.toBeEmpty();
}

test.describe('Design System Visual Regression - Components', () => {
  test('button component story', async ({ page }) => {
    await page.goto('/iframe.html?id=foundations-button--default&viewMode=story');
    await waitForStoryReady(page);
    await expect(page).toHaveScreenshot('button-default.png');
  });

  test('button bracketed story', async ({ page }) => {
    await page.goto('/iframe.html?id=foundations-button--bracketed&viewMode=story');
    await waitForStoryReady(page);
    await expect(page).toHaveScreenshot('button-bracketed.png');
  });

  test('card component story', async ({ page }) => {
    await page.goto('/iframe.html?id=foundations-card--default&viewMode=story');
    await waitForStoryReady(page);
    await expect(page).toHaveScreenshot('card-default.png');
  });

  test('slide deck story', async ({ page }) => {
    await page.goto('/iframe.html?id=presentation-slidedeck--default-deck&viewMode=story');
    await waitForStoryReady(page);
    await expect(page).toHaveScreenshot('slidedeck-default.png');
  });

  test('lorem ipsum blog post story', async ({ page }) => {
    await page.goto('/iframe.html?id=blog-loremipsumpost--foundational-blog-post&viewMode=story');
    await waitForStoryReady(page);
    await expect(page).toHaveScreenshot('blog-post-foundational.png', { fullPage: true });
  });
});
