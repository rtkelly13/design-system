import { brutalistTokens } from './tokens';

/**
 * @deprecated Tailwind v3-style JS preset, superseded by the CSS-first token
 * contract: `@import "@rtkelly13/design-system/theme.css";` after
 * `@import "tailwindcss";`. Kept for `tailwind.config.js` consumers; will be
 * removed in a future release. `src/theme.css` is the source of truth — keep
 * this object in sync until it's deleted.
 */
export const brutalistTailwindPreset = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: brutalistTokens.fonts,
      colors: {
        brutalist: brutalistTokens.colors,
      },
      borderRadius: {
        none: '0px',
        DEFAULT: '0px',
      },
      boxShadow: {
        'hard-sm': brutalistTokens.shadows.hardSm,
        'hard-md': brutalistTokens.shadows.hardMd,
        'hard-lg': brutalistTokens.shadows.hardLg,
        'hard-cyan': brutalistTokens.shadows.hardCyan,
        'hard-pink': brutalistTokens.shadows.hardPink,
        'hard-yellow': brutalistTokens.shadows.hardYellow,
        'glow-cyan': brutalistTokens.shadows.glowCyan,
        'glow-pink': brutalistTokens.shadows.glowPink,
        'glow-orange': brutalistTokens.shadows.glowOrange,
      },
    },
  },
};

export default brutalistTailwindPreset;
