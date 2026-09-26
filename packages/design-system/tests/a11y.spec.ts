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
 * The components the visual suite asserts at a narrow viewport, read from its
 * `MOBILE_CASES` the same way `assertedStoryIds` reads the rest.
 */
function narrowViewportComponents(): Set<string> {
  const spec = readFileSync(path.join(ROOT, 'tests/visual.spec.ts'), 'utf8');
  const start = spec.indexOf('const MOBILE_CASES');
  const block = spec.slice(start, spec.indexOf('];', start));
  return new Set([...block.matchAll(/id: '([a-z0-9-]+)--/g)].map((m) => m[1]));
}

/**
 * Whether this story is scanned in this project.
 *
 * `chromium` scans everything. `mobile` scans only the components that have a
 * narrow-viewport case in the visual suite — every story of them, so a sibling
 * story like `--sketch-mode` stays in scope beside the `--dark-mode` one that
 * the visual suite names. It used to scan every story, which doubled the
 * slowest step in CI for answers that were already known.
 *
 * Measured, not assumed. The full matrix was run once with every violation
 * recorded (all impacts, every node target): 114 stories, both Levels, both
 * viewports. At the serious-and-critical bar this suite gates on, exactly one
 * result differed between the viewports — the `KNOWN` contrast node on
 * `saas-admindashboardlayout--sketch-mode` — and it is a component this scope
 * keeps. The rest are the same DOM laid out wider. Mobile went from 233 scans
 * to 58.
 *
 * The claim is kept honest rather than trusted: `A11Y_FULL_MATRIX=1` restores
 * every story in both projects, and `ci.yml` sets it on every push to `main`.
 * A story that starts differing at the narrow viewport fails there, the run
 * after it merges, and the fix is adding its component to `MOBILE_CASES` —
 * which it then needs anyway, since a layout that breaks narrow wants a
 * narrow baseline.
 */
const FULL_MATRIX = process.env.A11Y_FULL_MATRIX === '1';
const NARROW = narrowViewportComponents();
function scannedIn(project: string, id: string): boolean {
  return FULL_MATRIX || project !== 'mobile' || NARROW.has(id.split('--')[0]);
}

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
    for (const el of Array.from(document.querySelectorAll('[data-a11y-scope]'))) {
      el.removeAttribute('data-a11y-scope');
    }
    document.getElementById('storybook-root')?.setAttribute('data-a11y-scope', '');
    for (const el of Array.from(document.body.children)) {
      if (el.id !== 'storybook-root' && isStorySurface(el)) {
        el.setAttribute('data-a11y-scope', '');
      }
    }
  })()`);
}

/**
 * How a story reaches its second Level.
 *
 * Page load is about half of every scan here — navigation, Storybook's
 * preview boot, `waitForStoryRendered`, the fonts — and the second Level
 * repeated all of it to change one global. `.storybook/preview.ts` already
 * applies the toolbar global live: its decorator re-renders on
 * `updateGlobals` and sets `data-theme` on `<html>`. So the second Level is
 * reached by emitting that on the preview channel and waiting for the
 * re-render, the attribute and the fonts, instead of by a new page.
 *
 * - `in-place` — the pull-request default.
 * - `reload` — a fresh page per Level, which is what this suite always did.
 * - `compare` — switch in place, scan, then load the same Level fresh on the
 *   same page, scan again, and fail unless the two **full** violation sets
 *   match: every impact, not only the budgeted ones, and every node target.
 *   `ci.yml` runs this on every push to `main`, so the claim that the two
 *   pathways see the same page is re-checked after each merge rather than
 *   trusted — the same arrangement as `A11Y_FULL_MATRIX` above.
 *
 * The equivalence was measured before this landed: every asserted story that
 * takes both Levels, on both viewports, in both directions (midnight → sketch
 * and back), compared as full violation sets. See the PR that added this.
 *
 * ## One test per story, with a step per Level
 *
 * Playwright hands every test a fresh page, so a switch can only save a load
 * inside one test. Keeping a test per Level would mean sharing a page across
 * tests — `mode: 'serial'`, which skips sketch whenever midnight fails and so
 * hides half the result, or leaning on worker order, which a retry or a worker
 * restart silently undoes. So each story is one test, each Level a
 * `test.step`, and each Level's budget check an `expect.soft`: a midnight
 * failure still reports sketch. `KNOWN` stays a budget per scan, as before.
 */
const LEVEL_SWITCH = (process.env.A11Y_LEVEL_SWITCH ?? 'in-place') as 'in-place' | 'reload' | 'compare';
if (!['in-place', 'reload', 'compare'].includes(LEVEL_SWITCH)) {
  throw new Error(`A11Y_LEVEL_SWITCH must be in-place, reload or compare, not ${LEVEL_SWITCH}`);
}

const NO_MOTION = '*,*::before,*::after{transition:none!important;animation:none!important}';

/** A fresh page at this Level, rendered, with its fonts, and motion off. */
async function openStory(page: Page, id: string, level: string) {
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
  await page.addStyleTag({ content: NO_MOTION });
}

/**
 * The same page, re-rendered at another Level through the preview channel.
 *
 * Resolves on Storybook's own `storyRendered` for the re-render, then on the
 * attribute the decorator writes, then on the fonts and two frames — the
 * decorator's `ThemeProvider` reconciles its level in an effect, so the
 * attribute can land a commit before the tree beneath it has repainted. The
 * no-motion sheet is still in the document from `openStory`.
 */
async function switchLevel(page: Page, id: string, level: string) {
  await page.evaluate(async (next) => {
    const channel = (window as unknown as { __STORYBOOK_ADDONS_CHANNEL__?: {
      on: (event: string, fn: () => void) => void;
      off: (event: string, fn: () => void) => void;
      emit: (event: string, payload: unknown) => void;
    } }).__STORYBOOK_ADDONS_CHANNEL__;
    if (!channel) throw new Error('No Storybook preview channel on this page');
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`No storyRendered after switching to ${next}`)), 15_000);
      const done = () => {
        clearTimeout(timer);
        channel.off('storyRendered', done);
        resolve();
      };
      channel.on('storyRendered', done);
      channel.emit('updateGlobals', { globals: { level: next } });
    });
  }, level);
  await expect(page.locator('html')).toHaveAttribute('data-theme', level);
  // The suite's own render check, not a text check: a sparkline, a skeleton
  // or a story that portals everything to `body` has a root with no text,
  // and `toBeEmpty` read all of them as unrendered.
  await waitForStoryRendered(page, id);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

/** A violation set in a form two scans can be compared by: every impact, every target. */
function signature(violations: Awaited<ReturnType<typeof scan>>) {
  return violations
    .map((v) => ({ rule: v.id, impact: v.impact, targets: v.nodes.map((n) => n.target.join(' ')).sort() }))
    .sort((a, b) => (a.rule < b.rule ? -1 : a.rule > b.rule ? 1 : 0));
}

/** The serious-and-critical violations over their `KNOWN` budget. */
function overBudget(violations: Awaited<ReturnType<typeof scan>>) {
  return violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .filter((v) => v.nodes.length > (KNOWN[v.id] ?? 0))
    .map((v) => `${v.id} (${v.impact}, ${v.nodes.length}): ${v.help}`);
}

test.describe('Accessibility', () => {
  for (const id of assertedStoryIds()) {
    // A story that pins its own Level is scanned on that one only: forcing the
    // other mixes two palettes (see `pinsItsOwnLevel`).
    const levels = pinsItsOwnLevel(id) ? [LEVELS[0]] : [...LEVELS];

    test(`${id} — ${levels.join(' + ')}`, async ({ page }, testInfo) => {
      test.skip(
        !scannedIn(testInfo.project.name, id),
        'No narrow-viewport case for this component; see `scannedIn`',
      );
      // The ceiling was sized for one Level on one page. This test now does a
      // scan per Level, and `compare` a second load and scan for each switch,
      // so the budget scales with the work rather than silently halving.
      const scans = levels.length + (LEVEL_SWITCH === 'compare' ? levels.length - 1 : 0);
      test.setTimeout(testInfo.timeout * scans);

      for (const [index, level] of levels.entries()) {
        await test.step(level, async () => {
          if (index === 0 || LEVEL_SWITCH === 'reload') await openStory(page, id, level);
          else await switchLevel(page, id, level);

          // The root, plus anything the story portalled to `body`: `Modal`,
          // `AlertDialog`, `Drawer` and `Toast` all render outside the root by
          // design, and a scope of `#storybook-root` alone scanned an empty box
          // for every one of them (#273). The portal test is `IS_STORY_SURFACE`,
          // the one `waitForStoryRendered` uses, so the two cannot disagree about
          // what the story rendered. Page-level rules an isolated story trips —
          // no `main`, no `h1` — are moderate, below the serious bar this counts.
          // Re-marked after a switch: a re-render can replace a portal.
          await markScope(page);
          const violations = await scan(page);

          expect.soft(overBudget(violations), `${level}: serious or critical over budget`).toEqual([]);

          if (LEVEL_SWITCH === 'compare' && index > 0) {
            await openStory(page, id, level);
            await markScope(page);
            expect(
              signature(violations),
              `${level}: the in-place switch and a fresh load disagree — see LEVEL_SWITCH`,
            ).toEqual(signature(await scan(page)));
          }
        });
      }
    });
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
  { id: 'components-data-datatable--default', rowcount: null },
  { id: 'components-data-datatable--virtualized', rowcount: '10001' },
] as const;

test.describe('DataTable semantics', () => {
  for (const level of LEVELS) {
    for (const { id, rowcount } of DATATABLE_CASES) {
      test(`${id} — keyboard sort — ${level}`, async ({ page }, testInfo) => {
        test.skip(!scannedIn(testInfo.project.name, id), 'No narrow-viewport case for this component; see `scannedIn`');
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
  const id = 'components-overlays-menu--actions';
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

/**
 * Popups, open.
 *
 * The pass above scans each asserted story at rest, and a `Select` at rest is
 * a closed trigger: its listbox exists only once opened, portalled to `body`.
 * So the one surface #164 moved from the operating system to this palette
 * would be the one surface axe never saw. This opens it the way a keyboard
 * user does, then scans the same scope as above — the root plus every portal
 * surface (`markScope`), without Base UI's focus guards (`scan`). No `KNOWN`
 * budget: this is new, and starts at zero.
 */
const OPEN_POPUPS = [
  { id: 'components-actions-forms-select--disabled-option', trigger: '#storybook-root [role="combobox"]', popup: 'listbox' },
] as const;

test.describe('Accessibility — open popups', () => {
  for (const level of LEVELS) {
    for (const { id, trigger, popup } of OPEN_POPUPS) {
      test(`${id} open — ${level}`, async ({ page }, testInfo) => {
        test.skip(!scannedIn(testInfo.project.name, id), 'No narrow-viewport case for this component; see `scannedIn`');
        await page.goto(`/iframe.html?id=${id}&viewMode=story&globals=level:${level}`);
        await waitForStoryRendered(page, id);
        await page.evaluate(() => document.fonts.ready);
        await page.addStyleTag({
          content: '*,*::before,*::after{transition:none!important;animation:none!important}',
        });

        await page.locator(trigger).focus();
        await page.keyboard.press('ArrowDown');
        await expect(page.getByRole(popup)).toBeVisible();
        await page.keyboard.press('ArrowDown');

        await markScope(page);
        const serious = (await scan(page)).filter(
          (v) => v.impact === 'serious' || v.impact === 'critical',
        );
        expect(serious.map((v) => `${v.id} (${v.impact}, ${v.nodes.length}): ${v.help}`)).toEqual([]);
      });
    }
  }
});
