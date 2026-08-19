/**
 * The pre-ladder token surface.
 *
 * @deprecated Use the semantic API instead — `semanticTokens`, `accentVar()`,
 * `surfaceVar()`, `textVar()`, `borderVar()` from `lib/theme`, or the
 * `--ds-*` custom properties directly. Everything here resolves through the
 * compatibility aliases emitted by `theme.css`, so it still renders correctly on
 * all four levels, but the names describe hues rather than roles and the
 * aliases are removed once the components stop using them.
 */

import type { ThemeLevel } from './theme/levels';

export const brutalistTokens = {
  colors: {
    cyan: 'var(--ds-accent-primary)',
    pink: 'var(--ds-accent-tertiary)',
    yellow: 'var(--ds-accent-secondary)',
    neonGreen: 'var(--ds-intent-success)',
    neonCyan: 'var(--ds-accent-primary)',
    cyberOrange: 'var(--ds-accent-secondary)',
    darkBg: 'var(--ds-surface-base)',
    black: 'var(--ds-surface-base)',
    white: 'var(--ds-text-primary)',
  },
  fonts: {
    display: ['var(--ds-font-display)'],
    sans: ['var(--ds-font-body)'],
    mono: ['var(--ds-font-mono)'],
    pixel: ['var(--ds-font-pixel)'],
  },
  shadows: {
    hardSm: '2px 2px 0px 0px var(--ds-shadow-color)',
    hardMd: '4px 4px 0px 0px var(--ds-shadow-color)',
    hardLg: '6px 6px 0px 0px var(--ds-shadow-color)',
    hardCyan: '4px 4px 0px 0px var(--ds-accent-primary)',
    hardPink: '4px 4px 0px 0px var(--ds-accent-tertiary)',
    hardYellow: '4px 4px 0px 0px var(--ds-accent-secondary)',
    glowCyan:
      '0 0 10px color-mix(in oklab, var(--ds-accent-primary) 50%, transparent), 0 0 20px color-mix(in oklab, var(--ds-accent-primary) 30%, transparent)',
    glowPink:
      '0 0 10px color-mix(in oklab, var(--ds-accent-tertiary) 50%, transparent), 0 0 20px color-mix(in oklab, var(--ds-accent-tertiary) 30%, transparent)',
    glowOrange:
      '0 0 20px color-mix(in oklab, var(--ds-accent-secondary) 80%, transparent), 0 0 40px color-mix(in oklab, var(--ds-accent-secondary) 50%, transparent)',
  },
  borders: {
    standard: '2px solid var(--ds-border-strong)',
    radius: '0px',
  },
} as const;

/**
 * @deprecated Renamed to {@link ThemeLevel}. The ladder replaced the old
 * `dark | dim | sketch` set: `dark` is now `midnight`, `sketch` is now
 * `bright`, and `white` is new.
 */
export type BrutalistTheme = ThemeLevel;
