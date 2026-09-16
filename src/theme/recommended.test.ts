import { describe, expect, it } from 'vitest';
import { LEVELS, THEME_LEVELS } from './levels';
import {
  getRecommendedColours,
  getRecommendedColors,
  isRecommendedColourClass,
  isRecommendedColorClass,
  RECOMMENDED_COLOUR_CLASSES,
  RECOMMENDED_COLOUR_NAMESPACES,
  RECOMMENDED_COLOUR_ROLES,
  RECOMMENDED_COLOUR_VARS,
  RECOMMENDED_COLOURS,
  RECOMMENDED_COLORS,
} from './recommended';

describe('recommended colours', () => {
  it('covers both theme levels', () => {
    expect(Object.keys(RECOMMENDED_COLOURS)).toEqual(['midnight', 'sketch']);
    expect(RECOMMENDED_COLORS).toBe(RECOMMENDED_COLOURS);
  });

  it('matches the values declared in LEVELS', () => {
    for (const level of THEME_LEVELS) {
      const rec = RECOMMENDED_COLOURS[level];
      const def = LEVELS[level];

      expect(rec.surface).toEqual(def.surface);
      expect(rec.content).toEqual(def.text);
      expect(rec.edge).toEqual(def.border);
      expect(rec.accent).toEqual(def.accent);
      expect(rec.intent).toEqual(def.intent);
    }
  });

  it('provides getRecommendedColours helper defaulting to midnight', () => {
    expect(getRecommendedColours('midnight')).toBe(RECOMMENDED_COLOURS.midnight);
    expect(getRecommendedColours('sketch')).toBe(RECOMMENDED_COLOURS.sketch);
    expect(getRecommendedColours()).toBe(RECOMMENDED_COLOURS.midnight);
    expect(getRecommendedColors).toBe(getRecommendedColours);
  });

  it('exposes the 5 recommended namespaces and their roles', () => {
    expect(RECOMMENDED_COLOUR_NAMESPACES).toEqual([
      'surface',
      'content',
      'edge',
      'accent',
      'intent',
    ]);
    expect(Object.keys(RECOMMENDED_COLOUR_ROLES)).toEqual([
      'surface',
      'content',
      'edge',
      'accent',
      'intent',
    ]);
  });

  it('RECOMMENDED_COLOUR_VARS contains valid --ds-* variable expressions', () => {
    for (const ns of RECOMMENDED_COLOUR_NAMESPACES) {
      for (const val of Object.values(RECOMMENDED_COLOUR_VARS[ns])) {
        expect(val).toMatch(/^var\(--ds-[a-z-]+\)$/);
      }
    }
  });

  it('RECOMMENDED_COLOUR_CLASSES covers expected utilities', () => {
    expect(RECOMMENDED_COLOUR_CLASSES).toContain('bg-surface-base');
    expect(RECOMMENDED_COLOUR_CLASSES).toContain('text-content-primary');
    expect(RECOMMENDED_COLOUR_CLASSES).toContain('border-edge-strong');
    expect(RECOMMENDED_COLOUR_CLASSES).toContain('text-accent-primary');
    expect(RECOMMENDED_COLOUR_CLASSES).toContain('text-intent-danger');
  });

  it('isRecommendedColourClass correctly validates classes with or without variants', () => {
    expect(isRecommendedColourClass('bg-surface-raised')).toBe(true);
    expect(isRecommendedColourClass('hover:bg-surface-raised')).toBe(true);
    expect(isRecommendedColourClass('dark:md:text-content-primary')).toBe(true);
    expect(isRecommendedColourClass('border-edge-default')).toBe(true);

    // Non-semantic hues or arbitrary values
    expect(isRecommendedColourClass('bg-pink-500')).toBe(false);
    expect(isRecommendedColourClass('text-zinc-900')).toBe(false);
    expect(isRecommendedColourClass('bg-[#14142a]')).toBe(false);
    expect(isRecommendedColourClass('')).toBe(false);

    expect(isRecommendedColorClass).toBe(isRecommendedColourClass);
  });
});
