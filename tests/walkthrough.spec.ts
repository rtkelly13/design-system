import { readFileSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { test, type Page } from '@playwright/test';
import { STORYBOOK_INDEX, THEMES, WALKTHROUGH_DIR, shotPath, type StoryEntry } from './walkthrough.shared';
import { waitForStoryRendered } from './story-ready';

/**
 * Screenshot walkthrough of every Storybook story, in every theme.
 *
 * This is **not** a visual regression suite — it asserts nothing and has no
 * baselines. It exists to produce a reviewable CI artifact: a contact sheet
 * showing what the whole design system currently looks like, so a change to a
 * shared token can be eyeballed across every component at once rather than
 * inferred from a pixel-diff percentage.
 *
 * Deliberately separate from `visual.spec.ts`, which does have baselines and
 * must stay a pass/fail gate. Mixing them would mean either this suite blocks
 * merges on cosmetic churn, or that one stops gating.
 */

const stories = loadStories();

function loadStories(): StoryEntry[] {
  let raw: string;
  try {
    raw = readFileSync(STORYBOOK_INDEX, 'utf8');
  } catch {
    throw new Error(
      `Storybook index not found at ${STORYBOOK_INDEX}. Run \`pnpm build-storybook\` first.`,
    );
  }

  const parsed = JSON.parse(raw) as {
    entries: Record<string, { id: string; title: string; name: string; type?: string }>;
  };

  return Object.values(parsed.entries)
    .filter((entry) => entry.type === 'story')
    .map(({ id, title, name }) => ({ id, title, name }))
    .sort((a, b) => a.title.localeCompare(b.title) || a.name.localeCompare(b.name));
}

/**
 * Freeze anything that would make two runs of the same story differ: CSS
 * transitions, keyframe animations, caret blink. Without this the walkthrough
 * catches components mid-transition and the sheet is misleading.
 */
const FREEZE_CSS = `
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    caret-color: transparent !important;
  }
`;

/**
 * Storybook's backgrounds addon pins the preview background to a fixed hex
 * (dark, per `.storybook/preview.ts`). That is wrong for every theme but the
 * default — `sketch` would render light-on-paper inside a black frame. Defer
 * to the theme's own surface token instead.
 */
const THEME_SURFACE_CSS = `
  html, body, .sb-show-main {
    background-color: var(--color-black) !important;
  }
`;

async function capture(page: Page, story: StoryEntry, theme: string) {
  // ThemeProvider seeds its state from localStorage on first render, so the
  // value has to be in place before the bundle evaluates.
  await page.addInitScript((value) => {
    window.localStorage.setItem('brutalist_theme', value);
  }, theme);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`/iframe.html?id=${story.id}&viewMode=story`, {
    waitUntil: 'load',
  });

  // Verified before anything is captured: a walkthrough that silently
  // screenshots Storybook's error overlay is worse than no walkthrough.
  await waitForStoryRendered(page, story.id);

  await page.addStyleTag({ content: FREEZE_CSS + THEME_SURFACE_CSS });
  await page.waitForTimeout(300);

  const file = shotPath(theme, story.id);
  await mkdir(path.dirname(file), { recursive: true });
  await page.screenshot({ path: file, fullPage: true, animations: 'disabled' });
}

test.describe('Storybook walkthrough', () => {
  test.describe.configure({ mode: 'parallel' });

  for (const theme of THEMES) {
    for (const story of stories) {
      test(`${theme} — ${story.title} / ${story.name}`, async ({ page }) => {
        test.slow();
        await capture(page, story, theme);
      });
    }
  }
});

test.afterAll(async () => {
  // The contact sheet is assembled by `scripts/build-walkthrough-index.mjs`
  // after the run, so it sees every worker's output rather than one worker's.
  test.info().annotations.push({
    type: 'walkthrough',
    description: `${stories.length} stories × ${THEMES.length} themes → ${WALKTHROUGH_DIR}`,
  });
});
