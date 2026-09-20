import { describe, expect, it } from 'vitest';
import { DEFAULT_LEVEL, LEVELS, THEME_LEVELS } from './levels';
import {
  getRecommendedColours,
  isRecommendedColourClass,
  RECOMMENDED_COLOUR_CLASSES,
  RECOMMENDED_COLOUR_NAMESPACES,
  RECOMMENDED_COLOUR_PROPERTIES,
  RECOMMENDED_COLOUR_ROLES,
  RECOMMENDED_COLOUR_VARS,
  RECOMMENDED_COLOURS,
} from './recommended';

describe('recommended colours', () => {
  it('covers both theme levels', () => {
    expect(Object.keys(RECOMMENDED_COLOURS)).toEqual(['midnight', 'sketch']);
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

  it('provides getRecommendedColours helper defaulting to the ladder default', () => {
    expect(getRecommendedColours('midnight')).toBe(RECOMMENDED_COLOURS.midnight);
    expect(getRecommendedColours('sketch')).toBe(RECOMMENDED_COLOURS.sketch);
    expect(getRecommendedColours()).toBe(RECOMMENDED_COLOURS[DEFAULT_LEVEL]);
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

  it('RECOMMENDED_COLOUR_CLASSES covers every property × namespace × role', () => {
    for (const property of RECOMMENDED_COLOUR_PROPERTIES) {
      for (const namespace of RECOMMENDED_COLOUR_NAMESPACES) {
        for (const role of RECOMMENDED_COLOUR_ROLES[namespace]) {
          expect(RECOMMENDED_COLOUR_CLASSES).toContain(`${property}-${namespace}-${role}`);
        }
      }
    }
    expect(new Set(RECOMMENDED_COLOUR_CLASSES).size).toBe(RECOMMENDED_COLOUR_CLASSES.length);
  });

  it('isRecommendedColourClass validates role utilities and tolerates non-colour variants', () => {
    expect(isRecommendedColourClass('bg-surface-raised')).toBe(true);
    expect(isRecommendedColourClass('hover:bg-surface-raised')).toBe(true);
    expect(isRecommendedColourClass('border-edge-default')).toBe(true);

    // Non-semantic hues or arbitrary values
    expect(isRecommendedColourClass('bg-pink-500')).toBe(false);
    expect(isRecommendedColourClass('text-zinc-900')).toBe(false);
    expect(isRecommendedColourClass('bg-[#14142a]')).toBe(false);
    expect(isRecommendedColourClass('')).toBe(false);
  });

  it('isRecommendedColourClass rejects polarity variants — roles switch by level already', () => {
    expect(isRecommendedColourClass('dark:bg-surface-base')).toBe(false);
    expect(isRecommendedColourClass('light:text-content-primary')).toBe(false);
    expect(isRecommendedColourClass('md:dark:ring-accent-primary')).toBe(false);
    expect(isRecommendedColourClass('hover:scale-100')).toBe(false);
  });
});
