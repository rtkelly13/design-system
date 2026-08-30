/**
 * Every class this repo's own stylesheets define.
 *
 * `no-custom-classname` can only tell you a class is not a *Tailwind* class. On
 * its own that makes it unusable here: it flags `docs-toc-link` — a real rule in
 * `prose.css` — as loudly as `bracket-glyph`, which matched nothing anywhere and
 * had never done a thing.
 *
 * Deriving the whitelist from the stylesheets closes that gap. The rule then
 * answers the question actually worth asking — *does this class exist at all?* —
 * and it answers it without a hand-maintained list to rot. Migrate a docs-chrome
 * class into a `recipe` and it leaves `prose.css`, leaves this list, and the rule
 * starts rejecting it. Nothing to remember.
 *
 * Regex over a real parser on purpose: `postcss` is only here as a transitive
 * dependency of the lint plugin, and `check:deps` would rightly fail an undeclared
 * import. The shapes involved are selector lists and `@utility` names, which do not
 * need a parser — and a wrong answer here fails loudly as a lint error on a class
 * that plainly exists, not silently.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** The stylesheets that may define a class. `theme.css` is variables. */
const SHEETS = ['src/styles.css', 'src/prose.css', 'src/theme.css'];

/**
 * Real classes that no stylesheet here declares because a plugin generates them.
 *
 * The same exemption `check-css.mjs` keeps as `THIRD_PARTY`, for the same
 * reason: we never write the rule, so deriving the name from our own CSS cannot
 * find it. `not-prose` is `@tailwindcss/typography`'s own escape hatch — every
 * selector the plugin generates excludes a `not-prose` subtree — and it is the
 * documented way to nest chrome inside a `Prose` scope.
 *
 * It went unchecked until a story used it as a plain string: every existing
 * call site spells it inside a template literal ending in `.trim()`, which is
 * the one class-string shape `no-custom-classname` does not traverse (AGENTS.md
 * § Styling Lives in TSX). Keep this list short, and add to it only for a class
 * a dependency really does emit.
 */
const PLUGIN_CLASSES = ['not-prose'];

export function authoredClasses() {
  const found = new Set(PLUGIN_CLASSES);

  for (const sheet of SHEETS) {
    let css;
    try {
      css = readFileSync(path.join(ROOT, sheet), 'utf8');
    } catch {
      continue;
    }
    // Comments first: `.foo` inside a doc comment is prose, not a rule.
    css = css.replace(/\/\*[\s\S]*?\*\//g, '');

    // `@utility prose-ladder { … }` declares a utility, so the name is a class.
    for (const m of css.matchAll(/@utility\s+([a-zA-Z_][\w-]*)/g)) found.add(m[1]);

    // Otherwise take the selector text ahead of each block and read its classes.
    for (const m of css.matchAll(/([^{}]+)\{/g)) {
      const selector = m[1];
      // Skip at-rule preludes — `@media (min-width: …)` has no selectors.
      if (/^\s*@(?!utility)/.test(selector)) continue;
      for (const c of selector.matchAll(/\.(-?[a-zA-Z_][\w-]*)/g)) found.add(c[1]);
    }
  }

  return [...found].sort();
}
