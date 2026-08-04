import { expect, test } from '@playwright/test';
import { waitForStoryRendered } from './story-ready';

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

/**
 * A fixed delay used to be the only wait here, which is how every baseline in
 * this suite came to be a screenshot of Storybook's "No Preview" panel: the
 * page had painted, so the shot succeeded, but no story had rendered.
 */
async function waitForStoryReady(page: import('@playwright/test').Page, storyId: string) {
  await waitForStoryRendered(page, storyId);
  await page.waitForTimeout(300);
}

test.describe('Design System Visual Regression - Components', () => {
  test('button component story', async ({ page }) => {
    await page.goto('/iframe.html?id=foundations-button--default&viewMode=story');
    await waitForStoryReady(page, 'foundations-button--default');
    await expect(page).toHaveScreenshot('button-default.png');
  });

  test('button bracketed story', async ({ page }) => {
    await page.goto('/iframe.html?id=foundations-button--bracketed&viewMode=story');
    await waitForStoryReady(page, 'foundations-button--bracketed');
    await expect(page).toHaveScreenshot('button-bracketed.png');
  });

  test('card component story', async ({ page }) => {
    await page.goto('/iframe.html?id=foundations-card--default&viewMode=story');
    await waitForStoryReady(page, 'foundations-card--default');
    await expect(page).toHaveScreenshot('card-default.png');
  });

  test('slide deck story', async ({ page }) => {
    await page.goto('/iframe.html?id=presentation-slidedeck--default-deck&viewMode=story');
    await waitForStoryReady(page, 'presentation-slidedeck--default-deck');
    await expect(page).toHaveScreenshot('slidedeck-default.png');
  });

  test('lorem ipsum blog post story', async ({ page }) => {
    await page.goto('/iframe.html?id=blog-loremipsumpost--foundational-blog-post&viewMode=story');
    await waitForStoryReady(page, 'blog-loremipsumpost--foundational-blog-post');
    await expect(page).toHaveScreenshot('blog-post-foundational.png', { fullPage: true });
  });
});
