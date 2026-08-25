/**
 * The theme ladder — the single place a level name or a level's colour is written.
 *
 * Everything else in the system derives from this file: the CSS in
 * `theme.generated.css`, the runtime provider, the Storybook toolbar, the
 * walkthrough matrix, and the contrast gate. Adding a level here is a type
 * error everywhere it has not been handled; adding a *role* is a type error in
 * every level at once. That is the guarantee — not a convention.
 *
 * ## Why a ladder and not a polarity
 *
 * Tailwind offers `default` and `dark`, so systems built on it tend to model
 * theming as a single flip. That collapses as soon as two themes share a
 * polarity: `bright` and `white` are both light but want different grounds and
 * different accents, and `midnight` and `dim` are both dark but differ in
 * saturation and neutral temperature. Polarity is therefore a *declared
 * property of a level* (see {@link LevelDefinition.polarity}) rather than the
 * axis everything hangs off. It still drives `color-scheme`, the
 * `prefers-color-scheme` default, and the `dark:`/`light:` variants — it just
 * does so downstream of the enum instead of competing with it.
 *
 * ## Why every value is a literal
 *
 * The previous token layer derived surfaces, text and borders from two poles
 * with `color-mix()` percentages. Percentages tuned against near-black do not
 * hold at the light end — `border-subtle` at 28% is a visible hairline on
 * black and invisible on paper. Literals also make the ladder *checkable*:
 * `pnpm check:contrast` can compute every text-on-surface ratio without a
 * browser, which is what makes four levels sustainable rather than four times
 * the manual review.
 *
 * The one exception is `surface.overlay`, which is a scrim and needs alpha.
 */

import type { BorderTone, Emphasis, Intent, Surface, TextTone } from '../lib/theme';

/**
 * The ladder, ordered from darkest to lightest. Order is meaningful: it is what
 * `cycleLevel` steps through and what the Storybook toolbar and walkthrough
 * matrix render in.
 */
export const THEME_LEVELS = ['midnight', 'dim', 'bright', 'white'] as const;

/** A level of the ladder. */
export type ThemeLevel = (typeof THEME_LEVELS)[number];

/**
 * Whether a level reads as dark-on-light or light-on-dark. Declared per level
 * rather than inferred, because it drives things a luminance calculation should
 * not silently decide: the `color-scheme` property (which controls native form
 * controls, scrollbars and the caret), the `dark:`/`light:` Tailwind variants,
 * and the `prefers-color-scheme` mapping.
 */
export type Polarity = 'dark' | 'light';

/**
 * Every colour a level must define. Adding a field here is a compile error in
 * all four levels until each one answers it — the property that a bare string
 * union cannot provide.
 */
export interface LevelDefinition {
  /** Human-facing name, used in the Storybook toolbar and the sandbox. */
  readonly label: string;
  /** One line on what the level is for. Rendered in the sandbox. */
  readonly description: string;
  readonly polarity: Polarity;
  readonly surface: Readonly<Record<Surface, string>>;
  readonly text: Readonly<Record<TextTone, string>>;
  readonly border: Readonly<Record<BorderTone, string>>;
  readonly accent: Readonly<Record<Emphasis, string>>;
  readonly intent: Readonly<Record<Intent, string>>;
  /** Colour of the hard offset shadows. Normally tracks `border.strong`. */
  readonly shadow: string;
}

/**
 * Surfaces do not move in the same direction on every level, and that is the
 * point of declaring them.
 *
 * On the dark levels a raised card sits *above* the page and so lightens. On
 * `bright` — a warm desk with paper on it — a raised card is a fresh white
 * sheet, so it also lightens, but past the ground rather than away from black.
 * On `white` there is nowhere lighter to go, so elevation is carried by the
 * hard border and shadow while the panel itself takes a faint cool grey. A
 * single derived formula cannot express those three behaviours; four literal
 * ramps can.
 */
export const LEVELS: Readonly<Record<ThemeLevel, LevelDefinition>> = {
  midnight: {
    label: 'Midnight',
    description: 'Neon on blue-black. The maximal end of the ladder.',
    polarity: 'dark',
    surface: {
      base: '#0a0a1a',
      raised: '#14142a',
      sunken: '#050510',
      overlay: 'rgba(5, 5, 16, 0.82)',
    },
    text: {
      primary: '#ffffff',
      secondary: '#c3c3d4',
      muted: '#8b8ba3',
      inverse: '#0a0a1a',
    },
    border: {
      strong: '#ffffff',
      default: '#9d9db4',
      subtle: '#33334d',
    },
    accent: {
      primary: '#22d3ee',
      secondary: '#facc15',
      tertiary: '#ec4899',
      quiet: '#8b8ba3',
    },
    intent: {
      info: '#22d3ee',
      success: '#39ff14',
      warning: '#facc15',
      danger: '#ec4899',
    },
    shadow: '#ffffff',
  },

  dim: {
    label: 'Dim',
    description: 'Desaturated neutrals and softer inks, for long reading.',
    polarity: 'dark',
    surface: {
      base: '#121316',
      raised: '#1c1d21',
      sunken: '#0c0d0f',
      overlay: 'rgba(12, 13, 15, 0.82)',
    },
    text: {
      primary: '#e4e4e7',
      secondary: '#b0b1b8',
      muted: '#8a8b93',
      inverse: '#121316',
    },
    border: {
      strong: '#e4e4e7',
      default: '#8f9099',
      subtle: '#3c3d44',
    },
    accent: {
      primary: '#38bdf8',
      secondary: '#fbbf24',
      tertiary: '#f43f5e',
      quiet: '#8a8b93',
    },
    intent: {
      info: '#38bdf8',
      success: '#4ade80',
      warning: '#fbbf24',
      danger: '#f43f5e',
    },
    shadow: '#e4e4e7',
  },

  bright: {
    label: 'Bright',
    description: 'Warm sketch paper and pen ink. The characterful light level.',
    polarity: 'light',
    surface: {
      base: '#fcfbf9',
      raised: '#ffffff',
      sunken: '#f4f1e9',
      overlay: 'rgba(24, 24, 27, 0.72)',
    },
    text: {
      primary: '#18181b',
      secondary: '#4b4a45',
      muted: '#66655e',
      inverse: '#fcfbf9',
    },
    border: {
      strong: '#18181b',
      default: '#7c7a72',
      subtle: '#cbc5b7',
    },
    accent: {
      primary: '#2563eb',
      secondary: '#c2410c',
      tertiary: '#c81e1e',
      quiet: '#66655e',
    },
    intent: {
      info: '#2563eb',
      success: '#146c34',
      warning: '#9a4708',
      danger: '#c81e1e',
    },
    shadow: '#18181b',
  },

  white: {
    label: 'White',
    description: 'Neutral and print-safe, for dense UI and documents.',
    polarity: 'light',
    surface: {
      base: '#ffffff',
      raised: '#f7f8fa',
      sunken: '#eef1f5',
      overlay: 'rgba(11, 11, 13, 0.7)',
    },
    text: {
      primary: '#0b0b0d',
      secondary: '#42454d',
      muted: '#5f636d',
      inverse: '#ffffff',
    },
    border: {
      strong: '#0b0b0d',
      default: '#73777f',
      subtle: '#c6cad2',
    },
    accent: {
      primary: '#1d4ed8',
      secondary: '#9a4708',
      tertiary: '#be123c',
      quiet: '#5f636d',
    },
    intent: {
      info: '#1d4ed8',
      success: '#146c34',
      warning: '#9a4708',
      danger: '#b91c1c',
    },
    shadow: '#0b0b0d',
  },
};

/** The level applied when nothing else has been chosen or persisted. */
export const DEFAULT_LEVEL: ThemeLevel = 'midnight';

/**
 * Which level each OS colour-scheme preference maps to. `prefers-color-scheme`
 * is binary, so the ladder has to nominate a representative at each end; making
 * that an explicit constant means it can be changed in one place rather than
 * being an accident of ordering.
 */
export const SYSTEM_LEVEL: Readonly<Record<Polarity, ThemeLevel>> = {
  dark: 'midnight',
  light: 'bright',
};

/** Type guard for values arriving from `localStorage`, URLs, or props. */
export function isThemeLevel(value: unknown): value is ThemeLevel {
  return typeof value === 'string' && (THEME_LEVELS as readonly string[]).includes(value);
}

/**
 * Level names from before 0.2.0, and what replaced them.
 *
 * `dim` is deliberately absent: it is the one rung whose name did not change.
 * The pre-0.2.0 ladder was `dark | dim | sketch`, so this is a clean 1:1
 * rename with `white` added at the light end — not a merge, and not a guess.
 *
 * **This is a diagnostic table, not an alias table.** Nothing resolves through
 * it, and that is the decision: a compatibility shim emitting
 * `[data-theme="dark"]` would have been safe to write and impossible to remove.
 * `theme.css` already carries one deprecated compat block for exactly this
 * reason — it ships to consumers, so deleting it is a breaking change, and it
 * has outlived every call site it was written for. One of those is enough.
 *
 * What a rename needs instead is to fail where someone can see it. A
 * `data-theme` selector that matches nothing fails silently, which is the
 * failure mode `Divider`'s doc comment was written about.
 */
export const RENAMED_LEVELS: Readonly<Record<string, ThemeLevel>> = {
  dark: 'midnight',
  sketch: 'bright',
};

/** The message for a renamed level, or `undefined` if this is not one. */
export function describeRenamedLevel(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const replacement = RENAMED_LEVELS[value];
  if (!replacement) return undefined;
  return `theme level "${value}" was renamed to "${replacement}" in 0.2.0 and no longer matches anything`;
}

/** Reported at most once per (value, source) pair, so a render loop cannot spam. */
const reported = new Set<string>();

/**
 * Complain about a pre-0.2.0 level name, once.
 *
 * Not gated behind `NODE_ENV`, on purpose. It fires only for the two names in
 * `RENAMED_LEVELS` — never for arbitrary junk — so it cannot become noise, and
 * a production app silently rendering the wrong rung is worse than a line in
 * the console. It also keeps this package free of a `process.env` assumption
 * about the consumer's bundler.
 */
export function reportRenamedLevel(value: unknown, source: string): void {
  const message = describeRenamedLevel(value);
  if (message === undefined) return;

  const key = `${source}:${String(value)}`;
  if (reported.has(key)) return;
  reported.add(key);

  console.error(
    `[@rtkelly13/design-system] ${message} (read from ${source}). ` +
      `The ladder is ${THEME_LEVELS.join(' → ')}. See CHANGELOG.md § 0.2.0.`
  );
}

/** The next level on the ladder, wrapping from the lightest back to the darkest. */
export function nextLevel(level: ThemeLevel): ThemeLevel {
  const index = THEME_LEVELS.indexOf(level);
  return THEME_LEVELS[(index + 1) % THEME_LEVELS.length]!;
}

/** Every level of a given polarity, in ladder order. */
export function levelsByPolarity(polarity: Polarity): ThemeLevel[] {
  return THEME_LEVELS.filter((level) => LEVELS[level].polarity === polarity);
}

/**
 * Exhaustiveness guard for `switch` statements over a level.
 *
 * Prefer a `Record<ThemeLevel, T>` where the branches are values — it is
 * checked without any call site remembering to add a default. Where control
 * flow genuinely has to branch, end the switch with `assertNever(level)` so
 * adding a fifth level fails the build instead of falling through.
 */
export function assertNever(value: never, message = 'Unhandled theme level'): never {
  throw new Error(`${message}: ${String(value)}`);
}
