import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { IS_STORY_SURFACE, waitForStoryRendered } from './story-ready';

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
const KNOWN: Record<string, number> = {
  /*
   * One node, on `saas-admindashboardlayout--sketch-mode` at the narrow
   * viewport: `#1450d7` on `#0a0a1a`, 2.94:1.
   *
   * Those are sketch's `accent.primary` and **midnight's** `surface.base`, which
   * is a combination the palette never produces. The story wraps the dashboard
   * in `<ThemeProvider defaultLevel="sketch" scoped className="min-h-screen
   * bg-surface-base">`, and that wrapper paints a viewport-wide box. At 412px
   * the dashboard's fixed-width grid overflows it, so a sketch-blue heading ends
   * up over the iframe body, which is still midnight.
   *
   * Real, and not a palette defect: `AdminDashboardLayout` is not responsive. It
   * is #189, and this line comes out with it rather than the violation being
   * excluded — a budget of 1 still fails on a second one.
   */
  'color-contrast': 1,
};

const LEVELS = ['midnight', 'sketch'] as const;

/**
 * Stories that pin their own Level, and must not be forced onto the other one.
 *
 * A story named `--dark-mode` or `--sketch-mode` wraps itself in a provider for
 * that Level. Overriding the toolbar global on top renders *sketch's* accent on
 * *midnight's* ground — `#1450d7` on `#0a0a1a`, 2.94:1 — which axe reports as a
 * contrast failure and which is not one: no consumer can reach that combination,
 * because the component never chooses a ground and a Level never mixes.
 *
 * That cost an hour of chasing five "violations" on `SaasLandingPage` whose
 * measured colours matched no declared value on either Level. The real defect
 * from the same run — a `<pre>` that scrolls and cannot be focused — was
 * genuine, and is fixed.
 */
function pinsItsOwnLevel(id: string): boolean {
  return /--(dark|sketch|midnight)-mode$|--all-levels$/.test(id);
}

/**
 * Base UI's focus guards, and nothing else.
 *
 * Every Base UI popup (Menu, Popover, the dialogs) plants these beside its
 * trigger and around its popup: `aria-hidden="true"` `tabindex="0"` spans
 * whose only job is to catch Tab and redirect focus into or out of the popup
 * on the same event. Focus never rests on one, and a screen reader's virtual
 * cursor never lands on one because it is hidden. axe cannot see the
 * redirect, so it reports `aria-hidden-focus` whenever no dialog is open —
 * an open `Menu`, say. With a dialog open it marks the same spans
 * needs-review instead, which is why `Modal` and `Popover` never tripped it.
 *
 * Excluded by the attribute Base UI stamps on them rather than budgeted in
 * `KNOWN`, because a count would also hide a real `aria-hidden-focus`, like
 * the dismiss control #272 fixed. The test below plants one of those inside
 * an open menu and asserts it is still reported.
 */
const FOCUS_GUARD = '[data-base-ui-focus-guard]';

/** The asserted scope, minus Base UI's focus guards, serious or not. */
async function scan(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .include('[data-a11y-scope]')
    // Focus guards only: see `FOCUS_GUARD` above.
    .exclude(FOCUS_GUARD)
    .options({ resultTypes: ['violations'] })
    .analyze();
  return violations;
}

/**
 * Mark the story root and every surface the story portalled to `body` as the
 * scope `scan` reads.
 */
async function markScope(page: Page) {
  await page.evaluate(`(() => {
    const isStorySurface = ${IS_STORY_SURFACE};
    document.getElementById('storybook-root')?.setAttribute('data-a11y-scope', '');
    for (const el of Array.from(document.body.children)) {
      if (el.id !== 'storybook-root' && isStorySurface(el)) {
        el.setAttribute('data-a11y-scope', '');
      }
    }
  })()`);
}

test.describe('Accessibility', () => {
  for (const level of LEVELS) {
    for (const id of assertedStoryIds()) {
      test(`${id} — ${level}`, async ({ page }) => {
        test.skip(
          pinsItsOwnLevel(id) && level !== LEVELS[0],
          'Story pins its own Level; forcing the other one mixes two palettes',
        );

        const global = pinsItsOwnLevel(id) ? '' : `&globals=level:${level}`;
        await page.goto(`/iframe.html?id=${id}&viewMode=story${global}`);
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

        // The root, plus anything the story portalled to `body`: `Modal`,
        // `AlertDialog`, `Drawer` and `Toast` all render outside the root by
        // design, and a scope of `#storybook-root` alone scanned an empty box
        // for every one of them (#273). The portal test is `IS_STORY_SURFACE`,
        // the one `waitForStoryRendered` uses, so the two cannot disagree about
        // what the story rendered. Page-level rules an isolated story trips —
        // no `main`, no `h1` — are moderate, below the serious bar this counts.
        await markScope(page);

        const violations = await scan(page);

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

/**
 * `DataTable`'s semantics (#245), in a real browser rather than jsdom.
 *
 * The loop above axes a story at rest, and a table at rest is unsorted. These
 * drive the sort from the keyboard — Tab to the header's button, Enter, then
 * Space — and read the result back through role locators, which resolve
 * against the browser's accessibility tree rather than the DOM. Chromium's
 * CDP tree does not surface `aria-sort` or `aria-rowcount` as properties, so
 * the attribute is read off the node that tree says is the column header or
 * the table — the element carrying the role, which is where both must land.
 *
 * Axe runs twice per case, unsorted and sorted, on both Levels, on a table
 * that renders every row and on one that windows ten thousand.
 */
const DATATABLE_CASES = [
  { id: 'foundations-datatable--default', rowcount: null },
  { id: 'foundations-datatable--virtualized', rowcount: '10001' },
] as const;

test.describe('DataTable semantics', () => {
  for (const level of LEVELS) {
    for (const { id, rowcount } of DATATABLE_CASES) {
      test(`${id} — keyboard sort — ${level}`, async ({ page }) => {
        await page.goto(`/iframe.html?id=${id}&viewMode=story&globals=level:${level}`);
        await waitForStoryRendered(page, id);
        await page.evaluate(() => document.fonts.ready);
        await page.addStyleTag({
          content: '*,*::before,*::after{transition:none!important;animation:none!important}',
        });

        const axe = async () => {
          const { violations } = await new AxeBuilder({ page })
            .include('#storybook-root')
            .options({ resultTypes: ['violations'] })
            .analyze();
          return violations
            .filter((v) => v.impact === 'serious' || v.impact === 'critical')
            .map((v) => `${v.id} (${v.impact}, ${v.nodes.length}): ${v.help}`);
        };

        const root = page.locator('#storybook-root');
        const table = root.getByRole('table');
        const branch = root.getByRole('columnheader', { name: 'BRANCH' });
        const button = branch.getByRole('button', { name: 'BRANCH' });

        // Unsorted: no header claims an order.
        await expect(root.locator('th[aria-sort]')).toHaveCount(0);
        expect(await axe()).toEqual([]);

        // The keyboard path: Tab until the sort button has focus. The scroll
        // regions come first, so a bounded number of presses, not one.
        for (let i = 0; i < 6 && !(await button.evaluate((el) => el === document.activeElement)); i++) {
          await page.keyboard.press('Tab');
        }
        await expect(button).toBeFocused();

        await page.keyboard.press('Enter');
        await expect(branch).toHaveAttribute('aria-sort', 'ascending');
        await expect(root.locator('th[aria-sort]')).toHaveCount(1);
        await expect(button).toBeFocused();

        await page.keyboard.press('Space');
        await expect(branch).toHaveAttribute('aria-sort', 'descending');
        await expect(root.locator('th[aria-sort]')).toHaveCount(1);

        if (rowcount) {
          // The window is a few dozen rows; the table reports all of them.
          await expect(table).toHaveAttribute('aria-rowcount', rowcount);
          await expect(root.getByRole('row').nth(1)).toHaveAttribute('aria-rowindex', '2');
        } else {
          await expect(table).not.toHaveAttribute('aria-rowcount');
        }

        expect(await axe()).toEqual([]);
      });
    }
  }
});

/**
 * The exclusion is narrow: it removes Base UI's focus guards and nothing else.
 *
 * An open menu carries six guards, which is what the exclusion exists for.
 * Planted beside them are the two shapes of the real defect — a focusable
 * element that is itself `aria-hidden`, and a button under an `aria-hidden`
 * ancestor — and both must still be reported, while no guard is.
 */
test('the focus-guard exclusion still reports a real aria-hidden-focus', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'One project is enough to prove the scope');
  const id = 'foundations-menu--actions';
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  await waitForStoryRendered(page, id);
  await expect(page.locator('[data-slot="menu"]')).toBeVisible();
  expect(await page.locator(FOCUS_GUARD).count()).toBeGreaterThan(0);

  await page.evaluate(() => {
    const menu = document.querySelector('[data-slot="menu"]');
    const span = document.createElement('span');
    span.setAttribute('aria-hidden', 'true');
    span.tabIndex = 0;
    span.id = 'planted-span';
    const wrapper = document.createElement('div');
    wrapper.setAttribute('aria-hidden', 'true');
    wrapper.id = 'planted-wrapper';
    const button = document.createElement('button');
    button.id = 'planted-button';
    button.textContent = 'Hidden';
    wrapper.append(button);
    menu?.append(span, wrapper);
  });
  await markScope(page);

  const hidden = (await scan(page)).find((v) => v.id === 'aria-hidden-focus');
  const targets = (hidden?.nodes ?? []).map((n) => n.html);
  expect(targets.some((html) => html.includes('planted-span'))).toBe(true);
  expect(targets.some((html) => html.includes('planted-wrapper'))).toBe(true);
  expect(targets.some((html) => html.includes('data-base-ui-focus-guard'))).toBe(false);
});
