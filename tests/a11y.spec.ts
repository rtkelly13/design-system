import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { waitForStoryRendered } from './story-ready';

/**
 * An axe pass over every asserted story, on both Levels.
 *
 * Nine gates could measure colour to two decimal places and none could observe
 * an accessibility regression. #44 is the instance: `focus:outline-none` at
 * specificity (0,2,0) beat the global `:focus-visible` at (0,1,0) on three
 * components, and nothing saw it — `check:contrast` audits *declared role pairs*,
 * not a ring as rendered.
 *
 * ## Scope is the visual suite's own list
 *
 * This reads `tests/visual.spec.ts`'s asserted-story ids rather than every story
 * in the index. Those are already the one-representative-per-component set that
 * `check:visual-coverage` keeps honest at budget 0, so the two suites cover the
 * same surface and adding a component extends both at once.
 *
 * ## Both Levels, because half the rules are about colour
 *
 * `color-contrast` is the rule most likely to catch something here, and it can
 * only be true of a rendered Level. `midnight` and `sketch` are authored
 * independently (ADR 0003), so passing on one says nothing about the other.
 *
 * ## A ratchet, with the violations listed
 *
 * Serious and critical only, to start. `KNOWN` carries what exists today with
 * the component it is in, so a new violation fails while the backlog is paid
 * down — the same shape as every other budgeted gate here, and the reason PR #58
 * never merged when it tried to land its rules and their fixes together.
 */

/* `process.cwd()` rather than `import.meta` — Playwright loads specs through a
 * CJS-compatible path here, and `import.meta` is a syntax error in that context. */
const ROOT = process.cwd();

/** The asserted-story ids, read from the visual suite so the two cannot drift. */
function assertedStoryIds(): string[] {
  const spec = readFileSync(path.join(ROOT, 'tests/visual.spec.ts'), 'utf8');
  const ids = [...spec.matchAll(/id: '([a-z0-9-]+--[a-z0-9-]+)'/g)].map((m) => m[1]);
  return [...new Set(ids)];
}

/**
 * Violations that exist today, by rule. Lower a number as they are fixed; delete
 * the line at zero. A rule absent here is budgeted at zero and fails on sight.
 */
const KNOWN: Record<string, number> = {};

const LEVELS = ['midnight', 'sketch'] as const;

test.describe('Accessibility', () => {
  for (const level of LEVELS) {
    for (const id of assertedStoryIds()) {
      test(`${id} — ${level}`, async ({ page }) => {
        await page.goto(`/iframe.html?id=${id}&viewMode=story&globals=level:${level}`);
        await waitForStoryRendered(page, id);

        /*
         * Wait for the fonts, then suppress motion.
         *
         * `color-contrast` is the rule most likely to fire here and it measures
         * *rendered* text: a run that lands before the faces register measures
         * the fallback, at a different size and sometimes a different colour.
         * `docs/deterministic-rendering.md` names this as the second of the
         * three switches, and an accessibility gate that is a race is worse than
         * no gate — it teaches people to re-run it.
         */
        await page.evaluate(() => document.fonts.ready);
        await page.addStyleTag({
          content: '*,*::before,*::after{transition:none!important;animation:none!important}',
        });

        const { violations } = await new AxeBuilder({ page })
          .include('#storybook-root')
          .options({ resultTypes: ['violations'] })
          .analyze();

        const serious = violations.filter(
          (v) => v.impact === 'serious' || v.impact === 'critical',
        );

        const overBudget = serious.filter(
          (v) => v.nodes.length > (KNOWN[v.id] ?? 0),
        );

        expect(
          overBudget.map((v) => `${v.id} (${v.impact}, ${v.nodes.length}): ${v.help}`),
        ).toEqual([]);
      });
    }
  }
});
