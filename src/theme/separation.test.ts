/**
 * The separation gate, and the properties of the syntax palette it protects.
 *
 * These run against the real ladder rather than fixtures. The interesting
 * claims are about the shipped palette — that it clears both gates on every
 * ground, and that the two gates are not the same gate — and a fixture would
 * prove the arithmetic while missing all of that.
 */
import { describe, expect, it } from 'vitest';
import { auditContrast, contrastRatio, MINIMUM_RATIO } from './contrast';
import { LEVELS, THEME_LEVELS } from './levels';
import {
  ADJACENT_PAIRS,
  auditSeparation,
  luma,
  MIN_SEPARATION,
} from './separation';
import type { SyntaxRole } from '../lib/theme';

const ROLES: SyntaxRole[] = [
  'keyword',
  'string',
  'number',
  'function',
  'type',
  'variable',
  'comment',
  'punctuation',
];

describe('luma', () => {
  it('is BT.709 on the gamma-encoded channels, not WCAG luminance', () => {
    // The distinction that matters: WCAG linearises first, so its value for
    // mid-grey is ~0.216, not ~0.5. This gate reads the signal an encoder
    // samples, so #808080 must come back near 128.
    expect(luma('#808080')).toBeCloseTo(128, 0);
    expect(luma('#000000')).toBe(0);
    expect(luma('#ffffff')).toBeCloseTo(255, 6);
    // Green carries most of luma; blue almost none.
    expect(luma('#00ff00')).toBeCloseTo(182.4, 1);
    expect(luma('#0000ff')).toBeCloseTo(18.4, 1);
  });

  it('accepts the short hex form', () => {
    expect(luma('#fff')).toBeCloseTo(luma('#ffffff'), 6);
  });

  it('refuses anything that is not an opaque hex colour', () => {
    // A syntax token composited against an assumed backdrop would be measured
    // as a colour that never renders, so this throws rather than guessing.
    expect(() => luma('rgba(0, 0, 0, 0.5)')).toThrow(/opaque hex/);
    expect(() => luma('#12345678')).toThrow(/opaque hex/);
    expect(() => luma('transparent')).toThrow(/opaque hex/);
  });
});

describe('ADJACENT_PAIRS', () => {
  it('names only real roles, and names each pair once', () => {
    const seen = new Set<string>();
    for (const [a, b] of ADJACENT_PAIRS) {
      expect(ROLES).toContain(a);
      expect(ROLES).toContain(b);
      const key = [a, b].sort().join('/');
      expect(seen.has(key), `${key} listed twice`).toBe(false);
      seen.add(key);
    }
  });

  it('covers punctuation against every other role', () => {
    // The measured finding this list encodes: punctuation is the connective
    // tissue, appearing in pairs that carry 92% of all adjacencies. If a future
    // edit drops one of these, the palette could put punctuation on top of a
    // role it touches constantly and no test would notice.
    const partners = ADJACENT_PAIRS.filter((p) => p.includes('punctuation')).flat();
    for (const role of ROLES) {
      if (role === 'punctuation') continue;
      expect(partners, `punctuation vs ${role} not gated`).toContain(role);
    }
  });

  it('leaves the pairs that never touch free', () => {
    // Not an oversight — it is what makes the palette satisfiable at all. AA
    // pins each rung to a 117–132 luma band and eight roles held 20 apart need
    // 140, so separating all 28 pairs is impossible. These are the ones the
    // corpus shows never occurring adjacent.
    const gated = new Set(ADJACENT_PAIRS.map(([a, b]) => [a, b].sort().join('/')));
    for (const pair of ['string/type', 'function/number', 'comment/type', 'number/string']) {
      expect(gated.has(pair), `${pair} should not be gated`).toBe(false);
    }
    expect(ADJACENT_PAIRS).toHaveLength(10);
  });
});

describe('auditSeparation', () => {
  it('checks every adjacent pair on every level', () => {
    const results = auditSeparation(LEVELS);
    expect(results).toHaveLength(ADJACENT_PAIRS.length * THEME_LEVELS.length);
    for (const level of THEME_LEVELS) {
      expect(results.filter((r) => r.level === level)).toHaveLength(ADJACENT_PAIRS.length);
    }
  });

  it('passes on the shipped ladder', () => {
    const failures = auditSeparation(LEVELS).filter((r) => !r.passes);
    expect(
      failures.map((f) => `${f.level} ${f.pair} Δ${f.delta.toFixed(1)}`),
    ).toEqual([]);
  });

  it('fails a palette whose neighbours converge', () => {
    // The gate has to be able to fail, and this is the failure it exists for:
    // two colours that both clear AA comfortably and are the same brightness.
    const broken = {
      ...LEVELS,
      midnight: {
        ...LEVELS.midnight,
        syntax: { ...LEVELS.midnight.syntax, punctuation: LEVELS.midnight.syntax.string },
      },
    };
    const failures = auditSeparation(broken).filter((r) => !r.passes);
    expect(failures.length).toBeGreaterThan(0);
    expect(failures.every((f) => f.level === 'midnight')).toBe(true);
    // Both are legible against the ground; that is precisely why contrast alone
    // does not catch it.
    const { string: s } = LEVELS.midnight.syntax;
    expect(contrastRatio(s, LEVELS.midnight.surface.base)).toBeGreaterThan(MINIMUM_RATIO.syntax);
  });
});

describe('the syntax palette', () => {
  it('defines every role on every level', () => {
    for (const level of THEME_LEVELS) {
      for (const role of ROLES) {
        expect(LEVELS[level].syntax[role], `${level}.${role}`).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });

  it('reads on a code well, not just on the page', () => {
    // The ground that fails first on the light rungs. `surface.sunken` is what
    // the token layer calls a code well, and on `white` it is #eef1f5 — a full
    // step darker than the page, which is where `comment` first went under.
    for (const level of THEME_LEVELS) {
      const { syntax, surface } = LEVELS[level];
      for (const role of ROLES) {
        const bar =
          role === 'comment' || role === 'punctuation'
            ? MINIMUM_RATIO.syntaxQuiet
            : MINIMUM_RATIO.syntax;
        expect(
          contrastRatio(syntax[role], surface.sunken),
          `${level}.${role} on sunken`,
        ).toBeGreaterThanOrEqual(bar);
      }
    }
  });

  it('is audited by the contrast gate on all three grounds', () => {
    const pairs = auditContrast(LEVELS)
      .filter((r) => r.level === 'white' && r.pair.startsWith('syntax.'))
      .map((r) => r.pair);
    for (const ground of ['surface.base', 'surface.raised', 'surface.sunken']) {
      for (const role of ROLES) {
        expect(pairs).toContain(`syntax.${role} on ${ground}`);
      }
    }
  });

  it('gives the light rungs the weight axis the dark ones do not need', () => {
    // Light grounds compress the usable luma band from 132 to 117, so `bright`
    // and `white` carry distinctions colour alone cannot. The dark rungs have
    // the range and should not spend it on bold text.
    for (const level of ['bright', 'white'] as const) {
      expect(LEVELS[level].syntaxEmphasis.keyword?.weight, level).toBe(700);
      expect(LEVELS[level].syntaxEmphasis.type?.weight, level).toBe(600);
    }
    for (const level of ['midnight', 'dim'] as const) {
      expect(LEVELS[level].syntaxEmphasis.keyword?.weight, level).toBeUndefined();
    }
    // Comments are italic everywhere — the one distinction style carries alone.
    for (const level of THEME_LEVELS) {
      expect(LEVELS[level].syntaxEmphasis.comment?.italic, level).toBe(true);
    }
  });

  it('separates by more than the floor, so a small edit does not break it', () => {
    // Sitting exactly on 20.0 would mean any nudge fails the gate. Recording
    // the real headroom makes a regression legible as a number rather than as
    // a pass/fail flip.
    const tightest = Math.min(...auditSeparation(LEVELS).map((r) => r.delta));
    expect(tightest).toBeGreaterThanOrEqual(MIN_SEPARATION);
    expect(tightest).toBeLessThan(40);
  });
});
