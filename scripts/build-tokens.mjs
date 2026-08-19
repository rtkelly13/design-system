#!/usr/bin/env node
/**
 * Emit `src/theme.css` from `src/theme/levels.ts`.
 *
 * TypeScript gives exhaustiveness on the TS side of the ladder and nothing at
 * all on the CSS side — which is exactly where the drift lived: nine files
 * hand-listing three theme names, none of them connected, a missed one failing
 * silently by falling back to the root theme. Generating the CSS from the same
 * module closes that, and `--check` turns it into a CI gate rather than a habit.
 *
 *   node scripts/build-tokens.mjs           write the file
 *   node scripts/build-tokens.mjs --check   fail if the file is stale
 *
 * No build dependency: Node 22 strips TypeScript types natively, so this
 * imports the source module directly.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { LEVELS, THEME_LEVELS } from '../src/theme/levels.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Generated straight into the file consumers already import, rather than into a
// second file behind an @import — one fewer thing to copy at build time and one
// fewer way for the two to disagree.
const OUTPUT = path.join(ROOT, 'src', 'theme.css');

const BANNER = `/* GENERATED FILE — DO NOT EDIT.
 *
 * Source: src/theme/levels.ts   (edit that, not this)
 * Regenerate: pnpm tokens:build   ·   Verify: pnpm tokens:check
 *
 * Import order in a consumer's entrypoint:
 *
 *   @import "tailwindcss";
 *   @import "@rtkelly13/design-system/theme.css";
 *
 * ============================================================================
 * How the cascade works here, because it is not obvious
 * ============================================================================
 *
 * Every level block below declares LITERAL colours. That matters: a custom
 * property containing a var() reference is substituted where it is DECLARED,
 * not where it is used, so a token defined once on :root as var(--something)
 * inherits into descendants already resolved to the root theme's value — and a
 * nested theme panel keeps the outer theme's colours. The previous hand-written
 * token layer worked around that by re-declaring the indirected tokens on every
 * mode class. With literals the problem does not arise at all, and nesting to
 * any depth resolves by ordinary CSS inheritance.
 *
 * The Tailwind --color-* aliases DO indirect through --ds-*, so that a consumer
 * can override a role and have the utilities follow. Those are therefore
 * re-declared inside each level block, which is free in a generated file.
 */`;

/** `--ds-*` custom properties for one level, in a stable order. */
function levelVariables(definition) {
  const lines = [];
  const push = (name, value) => lines.push(`  --ds-${name}: ${value};`);

  for (const [key, value] of Object.entries(definition.surface)) push(`surface-${key}`, value);
  for (const [key, value] of Object.entries(definition.text)) push(`text-${key}`, value);
  for (const [key, value] of Object.entries(definition.border)) push(`border-${key}`, value);
  for (const [key, value] of Object.entries(definition.accent)) push(`accent-${key}`, value);
  for (const [key, value] of Object.entries(definition.intent)) push(`intent-${key}`, value);
  push('shadow-color', definition.shadow);
  push('polarity', definition.polarity);

  return lines.join('\n');
}

/**
 * The eight accent/intent roles, in the order the token tables list them.
 *
 * Only used to generate the role-named hard shadows below. Written once here
 * rather than eight times inline, for the same reason the level list lives in
 * `levels.ts`: a ninth role should not be addable in one place and missable in
 * another.
 */
const ACCENT_ROLES = [
  'accent-primary',
  'accent-secondary',
  'accent-tertiary',
  'accent-quiet',
  'intent-info',
  'intent-success',
  'intent-warning',
  'intent-danger',
];

/**
 * Hard shadows that offset in a *role's* colour.
 *
 * `--shadow-hard-md` offsets in `--ds-shadow-color`, which is the right default
 * and the wrong thing for a card that lifts in its own accent — that previously
 * forced a component back onto `shadow-hard-cyan`, i.e. back onto a hue name.
 * Deliberately 4px, matching `hard-md`: the palette-named three are 4px too, so
 * swapping one for the other cannot move a layout.
 */
const ROLE_SHADOWS = ACCENT_ROLES.map(
  (role) => `  --shadow-hard-${role}: 4px 4px 0px 0px var(--ds-${role});`,
).join('\n');

/**
 * The Tailwind-facing aliases and the shadow utilities, repeated per level so
 * that var() substitution re-runs at the themed element. See the banner.
 */
const TAILWIND_ALIASES = `  --color-surface-base: var(--ds-surface-base);
  --color-surface-raised: var(--ds-surface-raised);
  --color-surface-sunken: var(--ds-surface-sunken);
  --color-surface-overlay: var(--ds-surface-overlay);
  --color-content-primary: var(--ds-text-primary);
  --color-content-secondary: var(--ds-text-secondary);
  --color-content-muted: var(--ds-text-muted);
  --color-content-inverse: var(--ds-text-inverse);
  --color-edge-strong: var(--ds-border-strong);
  --color-edge-default: var(--ds-border-default);
  --color-edge-subtle: var(--ds-border-subtle);
  --color-accent-primary: var(--ds-accent-primary);
  --color-accent-secondary: var(--ds-accent-secondary);
  --color-accent-tertiary: var(--ds-accent-tertiary);
  --color-accent-quiet: var(--ds-accent-quiet);
  --color-intent-info: var(--ds-intent-info);
  --color-intent-success: var(--ds-intent-success);
  --color-intent-warning: var(--ds-intent-warning);
  --color-intent-danger: var(--ds-intent-danger);
  --shadow-hard-sm: 2px 2px 0px 0px var(--ds-shadow-color);
  --shadow-hard-md: 4px 4px 0px 0px var(--ds-shadow-color);
  --shadow-hard-lg: 6px 6px 0px 0px var(--ds-shadow-color);
${ROLE_SHADOWS}
  --shadow-glow-accent: 0 0 10px color-mix(in oklab, var(--ds-accent-primary) 50%, transparent), 0 0 20px color-mix(in oklab, var(--ds-accent-primary) 30%, transparent);`;

/**
 * Bridge for components not yet migrated off the old palette.
 *
 * The pre-ladder token layer overloaded `--color-black` to mean "page ground"
 * and `--color-white` to mean "ink", swapping them per theme. That is why
 * `bg-black` and `text-white` are still scattered through the components and
 * appear to work. Mapping the old names onto the new roles keeps every one of
 * them rendering correctly — including on the two new levels — so the component
 * migration can happen file by file instead of in one commit.
 *
 * `pnpm check:tokens` counts the remaining call sites; this block comes out
 * when that reaches zero.
 *
 * Not covered, and not coverable: literal Tailwind greys (`bg-zinc-900`,
 * `text-zinc-400`) baked into some components. They are real colours, not
 * aliases, so they stay dark on the light levels. The checker reports them.
 */
function compatAliases(definition) {
  return `  /* deprecated — see \`pnpm check:tokens\` */
  --color-black: ${definition.surface.base};
  --color-white: ${definition.text.primary};
  --border-color: ${definition.border.strong};
  --brutalist-cyan: ${definition.accent.primary};
  --brutalist-neonCyan: ${definition.accent.primary};
  --brutalist-pink: ${definition.accent.tertiary};
  --brutalist-yellow: ${definition.accent.secondary};
  --brutalist-cyberOrange: ${definition.accent.secondary};
  --brutalist-neonGreen: ${definition.intent.success};
  --brutalist-darkBg: ${definition.surface.base};
  --brutalist-shadow-color: ${definition.shadow};
  --color-brutalist-cyan: var(--ds-accent-primary);
  --color-brutalist-neonCyan: var(--ds-accent-primary);
  --color-brutalist-pink: var(--ds-accent-tertiary);
  --color-brutalist-yellow: var(--ds-accent-secondary);
  --color-brutalist-cyberOrange: var(--ds-accent-secondary);
  --color-brutalist-neonGreen: var(--ds-intent-success);
  --color-brutalist-darkBg: var(--ds-surface-base);
  --shadow-hard-cyan: 4px 4px 0px 0px var(--ds-accent-primary);
  --shadow-hard-pink: 4px 4px 0px 0px var(--ds-accent-tertiary);
  --shadow-hard-yellow: 4px 4px 0px 0px var(--ds-accent-secondary);
  --shadow-glow-cyan: 0 0 10px color-mix(in oklab, var(--ds-accent-primary) 50%, transparent), 0 0 20px color-mix(in oklab, var(--ds-accent-primary) 30%, transparent);
  --shadow-glow-pink: 0 0 10px color-mix(in oklab, var(--ds-accent-tertiary) 50%, transparent), 0 0 20px color-mix(in oklab, var(--ds-accent-tertiary) 30%, transparent);
  --shadow-glow-orange: 0 0 20px color-mix(in oklab, var(--ds-accent-secondary) 80%, transparent), 0 0 40px color-mix(in oklab, var(--ds-accent-secondary) 50%, transparent);`;
}

/** The same names, declared in `@theme` so Tailwind still emits the utilities. */
const COMPAT_THEME = `  --color-brutalist-cyan: var(--ds-accent-primary);
  --color-brutalist-neonCyan: var(--ds-accent-primary);
  --color-brutalist-pink: var(--ds-accent-tertiary);
  --color-brutalist-yellow: var(--ds-accent-secondary);
  --color-brutalist-cyberOrange: var(--ds-accent-secondary);
  --color-brutalist-neonGreen: var(--ds-intent-success);
  --color-brutalist-darkBg: var(--ds-surface-base);
  --shadow-hard-cyan: 4px 4px 0px 0px var(--ds-accent-primary);
  --shadow-hard-pink: 4px 4px 0px 0px var(--ds-accent-tertiary);
  --shadow-hard-yellow: 4px 4px 0px 0px var(--ds-accent-secondary);`;

/**
 * Match elements whose NEAREST themed ancestor-or-self is `level`.
 *
 * Reads as: inside this level (or being it), and neither inside nor being any
 * differently-themed element. That handles a themed panel nested in a
 * differently-themed page at any depth. It does not handle re-entering the same
 * level after leaving it (midnight > bright > midnight), where the innermost
 * subtree is excluded — the variables themselves still resolve correctly there,
 * so only the variant escape hatch is affected.
 */
function levelVariant(level) {
  const other = `[data-theme]:not([data-theme="${level}"])`;
  return `&:where([data-theme="${level}"], [data-theme="${level}"] *):not(:where(${other}, ${other} *))`;
}

/** The same test, for a set of levels — used for the polarity variants. */
function polarityVariant(levels) {
  const inside = levels
    .flatMap((level) => [`[data-theme="${level}"]`, `[data-theme="${level}"] *`])
    .join(', ');
  const other = levels.map((level) => `:not([data-theme="${level}"])`).join('');
  const outside = `[data-theme]${other}`;
  return `&:where(${inside}):not(:where(${outside}, ${outside} *))`;
}

function render() {
  const [firstLevel] = THEME_LEVELS;
  const byPolarity = (polarity) => THEME_LEVELS.filter((l) => LEVELS[l].polarity === polarity);

  const sections = [];

  sections.push(BANNER);
  sections.push(`
/* Tailwind v4 skips node_modules during automatic content detection, so the
 * utilities used inside the compiled components would never be generated in a
 * consumer's build without this. */
@source "./";`);

  sections.push(`
/* ==========================================================================
   Variants — one per level, plus the two polarity groups
   ==========================================================================

   Prefer a role token over a variant: a component written against
   --ds-surface-raised needs no variant at all and picks up a fifth level for
   free. Reach for these only for what tokens genuinely cannot express, such as
   a different border weight on one level. */

${THEME_LEVELS.map((level) => `@custom-variant ${level} (${levelVariant(level)});`).join('\n')}

/* Polarity is a declared property of a level, so these are derived rather than
 * being the axis the system hangs off. Use them for non-colour utilities that
 * genuinely depend on light-vs-dark — a shadow spread, an image filter — never
 * for colour, which the tokens already handle. */
@custom-variant dark (${polarityVariant(byPolarity('dark'))});
@custom-variant light (${polarityVariant(byPolarity('light'))});`);

  sections.push(`
/* ==========================================================================
   Utility surface
   ==========================================================================

   Declaring the token here is what makes Tailwind emit \`bg-surface-raised\`,
   \`text-accent-primary\`, \`border-edge-subtle\` and friends. The values are
   references; the literals live in the level blocks below. */

@theme {
${TAILWIND_ALIASES}

${COMPAT_THEME}

  --font-sans: var(--ds-font-body);
  --font-display: var(--ds-font-display);
  --font-mono: var(--ds-font-mono);
  --font-pixel: var(--ds-font-pixel);
}`);

  sections.push(`
/* ==========================================================================
   Typography roles — level-independent
   ========================================================================== */

:root {
  /* Fallback chains matter as much as the first choice: when the web font has
   * not loaded — a blocked CDN, a slow connection, the first paint — the next
   * entry decides the metrics, and a different fallback reflows the page. These
   * chains are the ones the global rules in styles.css have always used, so the
   * tokens and the globals now agree instead of quietly disagreeing. */
  --ds-font-display: var(--font-space-grotesk, "Space Grotesk"), var(--font-inter, "Inter"), sans-serif;
  --ds-font-body: var(--font-inter, "Inter"), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --ds-font-mono: var(--font-ibm-plex-mono, "IBM Plex Mono"), "Courier New", monospace;
  --ds-font-pixel: var(--font-vt323, "VT323"), monospace;
}`);

  sections.push(`
/* ==========================================================================
   The ladder
   ========================================================================== */
`);

  for (const level of THEME_LEVELS) {
    const definition = LEVELS[level];
    // The first level doubles as the unthemed default so a consumer who forgets
    // to set data-theme gets a complete, legible palette rather than a
    // half-painted page.
    const selector =
      level === firstLevel ? `:root, [data-theme="${level}"]` : `[data-theme="${level}"]`;

    sections.push(`/* ${definition.label} — ${definition.description} */
${selector} {
  color-scheme: ${definition.polarity};

${levelVariables(definition)}

${TAILWIND_ALIASES}

${compatAliases(definition)}
}
`);
  }

  sections.push(`/* Native form controls, scrollbars and the caret follow \`color-scheme\`, which
 * each level declares above. Without it a light level renders dark scrollbars
 * and an unreadable date picker while every styled element looks correct. */
`);

  return `${sections.join('\n')}`.replace(/\n{3,}/g, '\n\n').trimStart() + '\n';
}

const css = render();
const check = process.argv.includes('--check');

if (check) {
  let existing = '';
  try {
    existing = readFileSync(OUTPUT, 'utf8');
  } catch {
    console.error(`${path.basename(OUTPUT)} is missing. Run \`pnpm tokens:build\`.`);
    process.exit(1);
  }
  if (existing !== css) {
    console.error(
      `${path.basename(OUTPUT)} is out of date with src/theme/levels.ts.\nRun \`pnpm tokens:build\` and commit the result.`,
    );
    process.exit(1);
  }
  console.log(`${path.basename(OUTPUT)} is up to date (${THEME_LEVELS.length} levels).`);
} else {
  writeFileSync(OUTPUT, css, 'utf8');
  console.log(
    `Wrote src/${path.basename(OUTPUT)} — ${THEME_LEVELS.length} levels: ${THEME_LEVELS.join(', ')}`,
  );
}
