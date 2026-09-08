import { describe, expect, it } from 'vitest';
import { auditSelectionDevices, contrastRatio, MINIMUM_RATIO } from './contrast';
import { LEVELS, THEME_LEVELS } from './levels';

/**
 * The state rule — selected state is an accent fill or edge, never a surface
 * pair — rests on two facts about the ladder. Both are asserted here so a
 * palette change that broke either would say so, rather than letting the rule
 * quietly become wrong.
 */
describe('selection devices', () => {
  const results = auditSelectionDevices(LEVELS);

  it('audits every level', () => {
    for (const level of THEME_LEVELS) {
      expect(results.some((r) => r.level === level)).toBe(true);
    }
  });

  it('fill and edge clear the non-text bar on every level and every surface', () => {
    const devices = results.filter((r) => r.device !== 'surface pair');
    const failing = devices.filter((r) => !r.passes).map((r) => `${r.level}: ${r.pair} ${r.ratio.toFixed(2)}`);
    expect(failing).toEqual([]);
    expect(devices.every((r) => r.minimum === MINIMUM_RATIO.stateDevice)).toBe(true);
  });

  it('no surface pair is a selection device on any level', () => {
    // This is the fact the rule is built on. If a wider surface ramp ever makes
    // it false on one rung, the rule needs re-stating before the ramp ships:
    // a surface-pair widget would pass review there and vanish on the others.
    const pairs = results.filter((r) => r.device === 'surface pair');
    expect(pairs.length).toBe(THEME_LEVELS.length * 3);
    const usable = pairs.filter((r) => r.passes).map((r) => `${r.level}: ${r.pair} ${r.ratio.toFixed(2)}`);
    expect(usable).toEqual([]);
  });

  it('measures the light rungs where the trap actually bites', () => {
    // The concrete number behind the rule: on the light rungs the raised
    // surface is barely off the page.
    for (const level of ['bright', 'white'] as const) {
      const ratio = contrastRatio(LEVELS[level].surface.raised, LEVELS[level].surface.base);
      expect(ratio).toBeLessThan(1.3);
    }
  });
});
