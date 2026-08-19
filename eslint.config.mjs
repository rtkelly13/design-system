import tseslint from 'typescript-eslint';

import { TOKEN_RULES } from './scripts/token-rules.mjs';

/**
 * Lint config, and for now it does exactly one job: report a colour written as a
 * literal at the line that wrote it.
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
const noColourLiterals = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Address a colour by its role, not by its value. See AGENTS.md § Semantic Theming.',
    },
    schema: [],
  },
  create(context) {
    /** Report every match in a string, not just the first. */
    function check(node, text) {
      if (!text) return;
      for (const rule of TOKEN_RULES) {
        // A fresh regex per pass: the shared ones carry /g, so lastIndex would
        // otherwise leak between files and silently skip matches.
        const pattern = new RegExp(rule.pattern.source, rule.pattern.flags);
        let match;
        while ((match = pattern.exec(text)) !== null) {
          context.report({
            node,
            message: `${rule.label}: \`${match[0]}\`. ${rule.fix}`,
          });
          if (match[0] === '') pattern.lastIndex += 1;
        }
      }
    }

    return {
      // String literals, including JSX attribute values.
      Literal(node) {
        if (typeof node.value === 'string') check(node, node.value);
      },
      // Template literals are where composed class strings live, so skipping
      // them would exempt exactly the code most likely to be wrong.
      TemplateElement(node) {
        check(node, node.value?.cooked ?? node.value?.raw);
      },
    };
  },
};

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
    name: 'design-system/tokens',
    files: ['src/components/**/*.{ts,tsx}', 'src/stories/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'design-system': { rules: { 'no-colour-literals': noColourLiterals } } },
    rules: { 'design-system/no-colour-literals': 'error' },
  },
);
