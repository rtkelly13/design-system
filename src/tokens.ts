export const brutalistTokens = {
  colors: {
    cyan: 'var(--brutalist-cyan, #22d3ee)',
    pink: 'var(--brutalist-pink, #ec4899)',
    yellow: 'var(--brutalist-yellow, #facc15)',
    neonGreen: 'var(--brutalist-neonGreen, #39ff14)',
    neonCyan: 'var(--brutalist-neonCyan, #00ffff)',
    cyberOrange: 'var(--brutalist-cyberOrange, #ff8c00)',
    darkBg: 'var(--brutalist-darkBg, #0a0a1a)',
    black: 'var(--color-black, #000000)',
    white: 'var(--color-white, #ffffff)',
  },
  fonts: {
    display: ['var(--font-space-grotesk, "Space Grotesk")', 'system-ui', 'sans-serif'],
    sans: ['var(--font-inter, "Inter")', 'system-ui', 'sans-serif'],
    mono: ['var(--font-ibm-plex-mono, "IBM Plex Mono")', 'Courier New', 'monospace'],
    pixel: ['var(--font-vt323, "VT323")', 'monospace'],
  },
  shadows: {
    hardSm: '2px 2px 0px 0px var(--brutalist-shadow-color, rgba(255, 255, 255, 1))',
    hardMd: '4px 4px 0px 0px var(--brutalist-shadow-color, rgba(255, 255, 255, 1))',
    hardLg: '6px 6px 0px 0px var(--brutalist-shadow-color, rgba(255, 255, 255, 1))',
    hardCyan: '4px 4px 0px 0px var(--brutalist-cyan, #22d3ee)',
    hardPink: '4px 4px 0px 0px var(--brutalist-pink, #ec4899)',
    hardYellow: '4px 4px 0px 0px var(--brutalist-yellow, #facc15)',
    glowCyan:
      '0 0 10px color-mix(in oklab, var(--brutalist-cyan, #22d3ee) 50%, transparent), 0 0 20px color-mix(in oklab, var(--brutalist-cyan, #22d3ee) 30%, transparent)',
    glowPink:
      '0 0 10px color-mix(in oklab, var(--brutalist-pink, #ec4899) 50%, transparent), 0 0 20px color-mix(in oklab, var(--brutalist-pink, #ec4899) 30%, transparent)',
    glowOrange:
      '0 0 20px color-mix(in oklab, var(--brutalist-cyberOrange, #ff8c00) 80%, transparent), 0 0 40px color-mix(in oklab, var(--brutalist-cyberOrange, #ff8c00) 50%, transparent)',
  },
  borders: {
    standard: '2px solid var(--color-white, #ffffff)',
    radius: '0px',
  },
} as const;

export type BrutalistTheme = 'dark' | 'dim' | 'sketch';
