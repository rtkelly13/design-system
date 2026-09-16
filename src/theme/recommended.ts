/**
 * Recommended colours and semantic tokens for consumers of @rtkelly13/design-system.
 *
 * ## Why this exists
 *
 * Rule 3 (AGENTS.md) requires that colours are addressed by role, never by hue:
 * `bg-surface-raised` or `text-intent-danger`, not `cyan`.
 *
 * Consumers (such as the blog, talk presentation platforms, canvas/SVG renderers,
 * and AI agent linters) need to depend on these roles as structured, typed data:
 *
 * 1. Runtime hex/rgba values per level for graphics, canvas, and charts (`RECOMMENDED_COLOURS`)
 * 2. CSS custom property expressions for inline styles and styled components (`RECOMMENDED_COLOUR_VARS`)
 * 3. The canonical Tailwind utility classnames for linters and validation (`RECOMMENDED_COLOUR_CLASSES`)
 */

import type { BorderTone, Emphasis, Intent, Surface, TextTone } from '../lib/theme';
import { LEVELS, type ThemeLevel } from './levels';

/**
 * The five semantic namespaces that make up the recommended colour surface.
 */
export const RECOMMENDED_COLOUR_NAMESPACES = [
  'surface',
  'content',
  'edge',
  'accent',
  'intent',
] as const;

export type RecommendedColourNamespace = (typeof RECOMMENDED_COLOUR_NAMESPACES)[number];
export const RECOMMENDED_COLOR_NAMESPACES = RECOMMENDED_COLOUR_NAMESPACES;
export type RecommendedColorNamespace = RecommendedColourNamespace;

/**
 * The roles defined in each recommended namespace.
 */
export const RECOMMENDED_COLOUR_ROLES = {
  surface: ['base', 'raised', 'sunken', 'overlay'],
  content: ['primary', 'secondary', 'muted', 'inverse'],
  edge: ['strong', 'default', 'subtle'],
  accent: ['primary', 'secondary', 'tertiary', 'quiet'],
  intent: ['info', 'success', 'warning', 'danger'],
} as const;

export const RECOMMENDED_COLOR_ROLES = RECOMMENDED_COLOUR_ROLES;

/**
 * Resolved colour literals (hex/rgba) for each recommended role on a single theme level.
 */
export interface RecommendedThemeColours {
  readonly surface: Readonly<Record<Surface, string>>;
  readonly content: Readonly<Record<TextTone, string>>;
  readonly edge: Readonly<Record<BorderTone, string>>;
  readonly accent: Readonly<Record<Emphasis, string>>;
  readonly intent: Readonly<Record<Intent, string>>;
}

export type RecommendedThemeColors = RecommendedThemeColours;

/**
 * The recommended colour values for each level of the theme ladder.
 *
 * Use this in non-CSS environments (canvas, SVG generation, email templates, charts)
 * where CSS custom properties cannot resolve.
 */
export const RECOMMENDED_COLOURS: Readonly<Record<ThemeLevel, RecommendedThemeColours>> = {
  midnight: {
    surface: LEVELS.midnight.surface,
    content: LEVELS.midnight.text,
    edge: LEVELS.midnight.border,
    accent: LEVELS.midnight.accent,
    intent: LEVELS.midnight.intent,
  },
  sketch: {
    surface: LEVELS.sketch.surface,
    content: LEVELS.sketch.text,
    edge: LEVELS.sketch.border,
    accent: LEVELS.sketch.accent,
    intent: LEVELS.sketch.intent,
  },
};

export const RECOMMENDED_COLORS = RECOMMENDED_COLOURS;

/**
 * Return the recommended colours for a given theme level, defaulting to `midnight`.
 */
export function getRecommendedColours(level: ThemeLevel = 'midnight'): RecommendedThemeColours {
  return RECOMMENDED_COLOURS[level] ?? RECOMMENDED_COLOURS.midnight;
}

export const getRecommendedColors = getRecommendedColours;

/**
 * CSS custom property expressions for every recommended role, aligned with the
 * public Tailwind utility namespaces (`surface`, `content`, `edge`, `accent`, `intent`).
 */
export const RECOMMENDED_COLOUR_VARS = {
  surface: {
    base: 'var(--ds-surface-base)',
    raised: 'var(--ds-surface-raised)',
    sunken: 'var(--ds-surface-sunken)',
    overlay: 'var(--ds-surface-overlay)',
  },
  content: {
    primary: 'var(--ds-text-primary)',
    secondary: 'var(--ds-text-secondary)',
    muted: 'var(--ds-text-muted)',
    inverse: 'var(--ds-text-inverse)',
  },
  edge: {
    strong: 'var(--ds-border-strong)',
    default: 'var(--ds-border-default)',
    subtle: 'var(--ds-border-subtle)',
  },
  accent: {
    primary: 'var(--ds-accent-primary)',
    secondary: 'var(--ds-accent-secondary)',
    tertiary: 'var(--ds-accent-tertiary)',
    quiet: 'var(--ds-accent-quiet)',
  },
  intent: {
    info: 'var(--ds-intent-info)',
    success: 'var(--ds-intent-success)',
    warning: 'var(--ds-intent-warning)',
    danger: 'var(--ds-intent-danger)',
  },
} as const;

export const RECOMMENDED_COLOR_VARS = RECOMMENDED_COLOUR_VARS;

/**
 * Canonical Tailwind utility classes for recommended colours.
 * Useful for linters, AI agent instructions, and runtime class validation.
 */
export const RECOMMENDED_COLOUR_CLASSES = [
  'bg-surface-base',
  'bg-surface-raised',
  'bg-surface-sunken',
  'bg-surface-overlay',
  'text-content-primary',
  'text-content-secondary',
  'text-content-muted',
  'text-content-inverse',
  'border-edge-strong',
  'border-edge-default',
  'border-edge-subtle',
  'text-accent-primary',
  'text-accent-secondary',
  'text-accent-tertiary',
  'text-accent-quiet',
  'bg-accent-primary',
  'bg-accent-secondary',
  'bg-accent-tertiary',
  'bg-accent-quiet',
  'text-intent-info',
  'text-intent-success',
  'text-intent-warning',
  'text-intent-danger',
  'bg-intent-info',
  'bg-intent-success',
  'bg-intent-warning',
  'bg-intent-danger',
] as const;

export type RecommendedColourClass = (typeof RECOMMENDED_COLOUR_CLASSES)[number];
export const RECOMMENDED_COLOR_CLASSES = RECOMMENDED_COLOUR_CLASSES;
export type RecommendedColorClass = RecommendedColourClass;

/**
 * Test whether a Tailwind class addresses a recommended role utility.
 * Strips variant prefixes (e.g. `dark:`, `hover:`, `md:`) before testing.
 */
export function isRecommendedColourClass(className: string): boolean {
  if (!className) return false;
  const base = className.split(':').pop() ?? '';
  return (RECOMMENDED_COLOUR_CLASSES as readonly string[]).includes(base);
}

export const isRecommendedColorClass = isRecommendedColourClass;
