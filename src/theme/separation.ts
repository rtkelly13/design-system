/**
 * Luminance separation between syntax roles that actually sit next to each other.
 *
 * `contrast.ts` answers "can this be read against its background". That is not
 * sufficient for code: every token in a line clears the same background, and
 * the reader still has to tell one role from the next. Two colours can both
 * pass AA and be indistinguishable from each other.
 *
 * ## Why luminance rather than hue distance
 *
 * A pair separated only by chroma survives on a screen and fails everywhere
 * else it matters. H.264 at 4:2:0 keeps luma per pixel and discards three
 * quarters of the colour, so hue-only distinctions collapse as a glyph stroke
 * thins — which is exactly what happens when a code surface is rendered to
 * video. The same pairs are the ones that fail for a red-green colour-blind
 * reader. Luma is the channel that survives both, so it is the one gated here.
 *
 * ## Why only some pairs
 *
 * The obvious rule — every role distinguishable from every other — is
 * arithmetically impossible, and it is worth writing down why so nobody
 * re-derives it. WCAG AA pins every colour into one luminance band relative to
 * the ground:
 *
 * | rung     | usable band | width |
 * |----------|-------------|-------|
 * | midnight | 123–255     | 132   |
 * | dim      | 124–255     | 131   |
 * | bright   | 0–117       | 117   |
 * | white    | 0–119       | 119   |
 *
 * Eight roles held {@link MIN_SEPARATION} apart need 140 steps. No rung has
 * one. The premise is what is wrong: roles do not all meet. What has to be told
 * apart is what sits *adjacent*, and that is measurable rather than a matter of
 * opinion — see {@link ADJACENT_PAIRS}.
 *
 * Pure arithmetic over data, like `contrast.ts`: no browser, no bundler, and it
 * can audit a consumer's own overrides.
 */

import type { SyntaxRole } from '../lib/theme';
import type { LevelDefinition, ThemeLevel } from './levels';

/**
 * Parse an opaque hex colour to channels.
 *
 * `contrast.parseColor` does strictly more than this — alpha, `rgb()`,
 * `rgba()` — and is deliberately *not* imported. These gate modules are
 * consumed by `scripts/*.mjs` through Node's type stripping, which resolves
 * specifiers literally, while `tsconfig` uses `moduleResolution: bundler` and
 * so wants them extensionless. The two cannot both be satisfied by one import,
 * and every other module in `src/theme` avoids the problem by having no runtime
 * imports at all. Six lines keeps this one a leaf as well.
 *
 * Narrower on purpose, too: a syntax token is an opaque literal. A scrim in the
 * palette would be a bug, and this throws on one rather than compositing it
 * against an assumed backdrop.
 */
function channels(color: string): [number, number, number] {
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
  if (!hex) throw new Error(`Syntax colours must be opaque hex; got: ${color}`);
  const digits = hex[1]!;
  const expand = (s: string) => Number.parseInt(s.length === 1 ? s + s : s, 16);
  return digits.length === 3
    ? [expand(digits[0]!), expand(digits[1]!), expand(digits[2]!)]
    : [expand(digits.slice(0, 2)), expand(digits.slice(2, 4)), expand(digits.slice(4, 6))];
}

/**
 * BT.709 luma, 0–255 — the component a 4:2:0 encoder preserves per pixel.
 *
 * Deliberately *not* WCAG relative luminance. That is gamma-linearised for
 * perceptual contrast against a background; this is the gamma-encoded signal an
 * encoder actually samples, which is the thing that either survives subsampling
 * or does not.
 */
export function luma(color: string): number {
  const [r, g, b] = channels(color);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * The floor, in luma steps.
 *
 * Chosen as the smallest separation that still reads once a 1–2px stroke has
 * been through chroma subsampling. It is also close to the widest value the
 * band arithmetic above will admit for eight roles, so raising it does not fail
 * gracefully — it fails on `bright` first.
 */
export const MIN_SEPARATION = 20;

/**
 * Role pairs that occur adjacent in real source, and must therefore be told
 * apart.
 *
 * Measured, not assumed: 3,875 role transitions across five files in this
 * repository and `rtkelly13/blog` (`levels.ts`, `ThemeProvider.tsx`,
 * `terminalEngine.ts`, `Terminal.tsx`, `talkVideo.ts`). The distribution is
 * lopsided in a way that makes the rule tractable —
 *
 * ```
 * punctuation · variable   51.9%      number · punctuation      3.8%
 * keyword · punctuation    11.8%      keyword · variable        3.3%
 * punctuation · string      9.7%      comment · punctuation     2.0%
 * function · punctuation    7.0%      comment · keyword         1.2%
 * punctuation · type        6.3%      type · variable           0.6%
 * ```
 *
 * — because **punctuation is the connective tissue**: it appears in seven of
 * the eight hottest pairs, and pairs involving it carry 92% of all adjacencies.
 * Thirteen of the 28 possible pairs never occur at all (`string · type`,
 * `function · number`, `comment · type`, …) and are free to share a luma band
 * and differ by hue alone. That is what lets `midnight` park four literal roles
 * within 17 luma of each other and still read correctly.
 *
 * The cut is at 0.5% of transitions. A pair below that is rare enough that a
 * reader meets it a handful of times in a file, and buying it costs luminance
 * range that the common pairs need.
 */
export const ADJACENT_PAIRS: readonly (readonly [SyntaxRole, SyntaxRole])[] = [
  ['punctuation', 'variable'],
  ['keyword', 'punctuation'],
  ['punctuation', 'string'],
  ['function', 'punctuation'],
  ['punctuation', 'type'],
  ['number', 'punctuation'],
  ['keyword', 'variable'],
  ['comment', 'punctuation'],
  ['comment', 'keyword'],
  ['type', 'variable'],
] as const;

export interface SeparationCheck {
  level: ThemeLevel;
  /** e.g. `keyword vs punctuation`. */
  pair: string;
  a: string;
  b: string;
  /** Absolute BT.709 luma difference, 0–255. */
  delta: number;
  minimum: number;
  passes: boolean;
}

/**
 * Every adjacent pair, for every level.
 *
 * The ladder is passed in rather than imported, matching `auditContrast`, so a
 * consumer can audit their own overrides with the same function.
 */
export function auditSeparation(
  ladder: Readonly<Record<ThemeLevel, LevelDefinition>>,
): SeparationCheck[] {
  const results: SeparationCheck[] = [];

  for (const [level, def] of Object.entries(ladder) as [ThemeLevel, LevelDefinition][]) {
    for (const [roleA, roleB] of ADJACENT_PAIRS) {
      const a = def.syntax[roleA];
      const b = def.syntax[roleB];
      const delta = Math.abs(luma(a) - luma(b));
      results.push({
        level,
        pair: `${roleA} vs ${roleB}`,
        a,
        b,
        delta,
        minimum: MIN_SEPARATION,
        passes: delta >= MIN_SEPARATION,
      });
    }
  }

  return results;
}
