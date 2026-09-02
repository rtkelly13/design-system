import tseslint from 'typescript-eslint';
import tailwindcss from 'eslint-plugin-tailwindcss';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

import { authoredClasses } from './scripts/authored-classes.mjs';
import { noColourLiterals } from './scripts/eslint-token-rule.mjs';

/**
 * Lint config. Two rules, answering the two ways a class can be wrong: a colour
 * named by its value instead of its role, and a class that names nothing at all.
 * `src/lint.test.ts` pins both, and pins this configuration — most of what can
 * break here is a setting, not rule logic.
 *
 * ## Why this exists next to `pnpm check:tokens`
 *
 * They are not duplicates, they answer different questions. `check:tokens`
 * answers *how much debt is left* — one number, in CI, after you have pushed.
 * This answers *where, and what should it be instead* — in the editor, before
 * the code is written. The second is what actually stops new violations, since
 * the first only ever says no once the work is done.
 *
 * Both read `scripts/token-rules.mjs`, so there is one definition of what counts
 * and the two cannot drift apart.
 *
 * ## Why a local rule rather than `no-restricted-syntax`
 *
 * `no-restricted-syntax` can match a string literal against a regex, so the four
 * patterns could have been inlined as selectors. That means serialising each
 * regex into an esquery selector string and keeping the escaping right — and it
 * loses the `fix` text, which is the half of the message worth reading. A rule
 * that applies the regexes directly reports `bg-zinc-900` *and* what to use
 * instead, and it reports every occurrence in a string rather than the first.
 *
 * ## Scope is load-bearing — read before widening it
 *
 * Only `src/components/**` and `src/stories/**`, matching `check:tokens`.
 *
 * `src/theme/levels.ts` is deliberately *not* linted, and must not be. Ladder
 * rule 4 says every level colour is a literal, precisely so `check:contrast`
 * can audit all 200 role pairs without a browser. Point this rule at it and it
 * reports the design as the bug — and the obvious way to silence it is to
 * delete the thing that makes the ladder auditable. Same for
 * `scripts/build-tokens.mjs`, which writes those literals out.
 *
 * `src/lib/accentClasses.ts` is exempt for the opposite reason: it has to spell
 * class names out in full because Tailwind's scanner reads source text, and a
 * template literal would generate no CSS at all.
 */

export default tseslint.config(
  {
    // Build output, reports and coverage are not source.
    ignores: [
      'dist/**',
      'storybook-static/**',
      'playwright-report/**',
      'walkthrough-report/**',
      'test-results/**',
      'coverage/**',
      'temp/**',
    ],
  },
  {
    /**
     * The general-purpose ruleset.
     *
     * The two rules below are this repo's own, and they are the interesting
     * ones — but for a long time they were the *only* ones. `typescript-eslint`
     * was imported for `tseslint.config()` and its parser, with no recommended
     * set spread in, so nothing checked an unused variable, a misused promise,
     * an exhaustive hook dependency list or any accessibility invariant. Nine
     * CI gates and a component could hijack the page's keyboard, desync its
     * fullscreen state from the browser and ship three unlabelled icon buttons
     * through all of them — see the `SlideDeck` fixes that landed with this
     * config.
     *
     * Scoped to `src/**` because that is what `pnpm lint` runs over. Wider than
     * the two custom rules below, which stop at `components` and `stories` for
     * reasons documented at each.
     */
    name: 'design-system/general',
    files: ['src/**/*.{ts,tsx}'],
    extends: [tseslint.configs.recommended],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    /**
     * Hook rules, and the reason they are worth the noise.
     *
     * `SlideDeck`'s keydown effect declared `[totalSlides]` while closing over
     * three handlers it did not list. That was harmless only by accident — the
     * state setters it reached were all functional updates — which is exactly
     * the condition `exhaustive-deps` exists to stop depending on.
     */
    name: 'design-system/react-hooks',
    files: ['src/**/*.{ts,tsx}'],
    // The plugin still ships its recommended set with an eslintrc-shaped
    // `plugins: ['react-hooks']` array, which flat config rejects. Register the
    // plugin object here and reuse its rule list, so the set stays whatever
    // upstream recommends rather than being copied out and pinned by hand.
    plugins: { 'react-hooks': reactHooks },
    rules: reactHooks.configs['recommended-latest'].rules,
  },
  {
    /**
     * Accessibility invariants that can be decided from the source.
     *
     * This is the static half of the gap #52 covers; an axe run over the built
     * stories is the other half, and neither subsumes the other. What this
     * catches is the shape of the markup — a control with no accessible name, a
     * handler on a non-interactive element, an `aria-*` attribute that does not
     * exist. What it cannot see is contrast, focus order, or anything that
     * depends on the rendered tree.
     */
    name: 'design-system/jsx-a11y',
    files: ['src/**/*.tsx'],
    extends: [jsxA11y.flatConfigs.recommended],
    rules: {
      /**
       * `group` joins the default `tabpanel` as a role that may hold
       * `tabIndex={0}`.
       *
       * A composite widget has to be focusable for its own keys to reach it, and
       * the ARIA carousel pattern is exactly this shape: `role="group"` plus an
       * `aria-roledescription`, with the container taking focus so the arrow
       * keys work. `SlideDeck` is the case — the alternative to a focusable
       * container is the `window` listener it just stopped using, which is
       * strictly worse for a keyboard user because it fires everywhere.
       */
      'jsx-a11y/no-noninteractive-tabindex': [
        'error',
        { tags: [], roles: ['tabpanel', 'group'], allowExpressionValues: true },
      ],
    },
  },
  {
    name: 'design-system/tokens',
    files: ['src/components/**/*.{ts,tsx}', 'src/stories/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'design-system': { rules: { 'no-colour-literals': noColourLiterals } } },
    rules: { 'design-system/no-colour-literals': 'error' },
  },
  {
    /**
     * Does this class exist at all?
     *
     * The rule above catches a colour named wrongly. This catches the other
     * failure, and the more expensive one: a class that names *nothing*.
     * `focus:border-brutalist-green`, `brutalist-card-panel`,
     * `.sketch .ascii-divider::after` and `bracket-glyph` were all of this kind —
     * dead on the day they were written, surviving every review that read them as
     * intentional, because Tailwind does not care. An unknown utility emits no
     * CSS, exits 0 and warns about nothing.
     *
     * `no-custom-classname` only knows Tailwind's own classes, which on its own
     * makes it unusable here — it flags `docs-toc-link`, a real rule in
     * `prose.css`, exactly as loudly as a dead one. The whitelist is therefore
     * *derived* from the stylesheets rather than hand-written, which turns the
     * question from "is this a Tailwind class" into "does this class exist", and
     * leaves nothing to maintain: a docs-chrome class migrated into a `recipe`
     * leaves `prose.css`, leaves the derived list, and starts being rejected.
     */
    name: 'design-system/classnames',
    files: ['src/components/**/*.{ts,tsx}', 'src/stories/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { tailwindcss },
    settings: {
      tailwindcss: {
        // Singular `src/style.css` is the plugin's default and does not exist here.
        cssConfigPath: 'src/styles.css',
        // `recipe` is this repo's name for `tv`. Without it the plugin never looks
        // inside a recipe — which is where most class strings live.
        functions: ['classnames', 'clsx', 'cn', 'cva', 'tv', 'recipe', 'twMerge'],
      },
    },
    rules: {
      'tailwindcss/no-custom-classname': ['error', { whitelist: authoredClasses() }],
    },
  },
);
