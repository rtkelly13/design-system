import { brutalistTokens } from './tokens';

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
