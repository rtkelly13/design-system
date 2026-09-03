/**
 * Contrast arithmetic over the ladder.
 *
 * Every colour in `levels.ts` is a literal, so contrast can be computed as data
 * — no browser, no screenshot, no rendering. `pnpm check:contrast` walks all
 * four levels and fails CI on a violation, which is the thing that makes a
 * four-rung ladder maintainable: 4 levels x ~15 role pairs is 60 combinations,
 * and nobody eyeballs 60 combinations reliably twice.
 *
 * The maths is WCAG 2.1 relative luminance. APCA is the better predictor of
 * perceived contrast, but it is not yet normative and its thresholds are not
 * stable; WCAG ratios are what an audit will be run against.
 */

import type { Emphasis, Intent, SyntaxRole, TextTone } from '../lib/theme';
import type { LevelDefinition, ThemeLevel } from './levels';

export interface Rgb {
  r: number;
  g: number;
  b: number;
  /** 0–1. Colours without an alpha channel parse as 1. */
  a: number;
}

const HEX = /^#([0-9a-f]{3,8})$/i;
const RGB_FN = /^rgba?\(\s*([0-9.]+)[\s,]+([0-9.]+)[\s,]+([0-9.]+)(?:[\s,/]+([0-9.]+))?\s*\)$/i;

/** Parse `#rgb`, `#rrggbb`, `#rrggbbaa`, `rgb()` and `rgba()`. */
export function parseColor(value: string): Rgb {
  const input = value.trim();

  const hex = HEX.exec(input);
  if (hex) {
    const digits = hex[1]!;
    const expand = (s: string) => Number.parseInt(s.length === 1 ? s + s : s, 16);
    if (digits.length === 3 || digits.length === 4) {
      return {
        r: expand(digits[0]!),
        g: expand(digits[1]!),
        b: expand(digits[2]!),
        a: digits.length === 4 ? expand(digits[3]!) / 255 : 1,
      };
    }
    if (digits.length === 6 || digits.length === 8) {
      return {
        r: expand(digits.slice(0, 2)),
        g: expand(digits.slice(2, 4)),
        b: expand(digits.slice(4, 6)),
        a: digits.length === 8 ? expand(digits.slice(6, 8)) / 255 : 1,
      };
    }
  }

  const fn = RGB_FN.exec(input);
  if (fn) {
    return {
      r: Number(fn[1]),
      g: Number(fn[2]),
      b: Number(fn[3]),
      a: fn[4] === undefined ? 1 : Number(fn[4]),
    };
  }

  throw new Error(`Unparseable colour: ${value}`);
}

/**
 * Flatten a possibly-translucent colour onto an opaque backdrop.
 *
 * Contrast is a property of what the eye receives, so a token with alpha has to
 * be composited before it can be measured. Without this step a scrim at 70%
 * would score against its own nominal colour and pass regardless of the surface
 * it actually sits on.
 */
export function composite(foreground: Rgb, backdrop: Rgb): Rgb {
  if (foreground.a >= 1) return foreground;
  const a = foreground.a;
  return {
    r: foreground.r * a + backdrop.r * (1 - a),
    g: foreground.g * a + backdrop.g * (1 - a),
    b: foreground.b * a + backdrop.b * (1 - a),
    a: 1,
  };
}

/** WCAG 2.1 relative luminance. */
export function relativeLuminance(color: Rgb): number {
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
}

/**
 * WCAG contrast ratio between two colours, 1–21.
 *
 * The foreground is composited onto the background first, so translucent
 * tokens are measured as they render.
 */
export function contrastRatio(foreground: string, background: string): number {
  const bg = parseColor(background);
  const fg = composite(parseColor(foreground), bg);
  const lighter = Math.max(relativeLuminance(fg), relativeLuminance(bg));
  const darker = Math.min(relativeLuminance(fg), relativeLuminance(bg));
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * The bar each role has to clear, and why it differs.
 *
 * `text` and the accents clear WCAG AA for body copy, because they are read.
 * `borderStrong` and `borderDefault` clear the 3:1 non-text bar of WCAG 1.4.11,
 * because they are the load-bearing edges this system draws components with.
 * `borderSubtle` is a decorative divider — 1.4.11 does not cover it, so the bar
 * is only that it must be *visible* rather than accessible as a control.
 * Setting it to AA would force every hairline in the system to read as a rule.
 */
export const MINIMUM_RATIO = {
  text: 4.5,
  /** `text.inverse` sits on an accent fill, not on a surface. */
  textInverse: 4.5,
  accent: 4.5,
  intent: 4.5,
  /** Code is read, so an emphasis role clears the body-copy bar. */
  syntax: 4.5,
  /**
   * `comment` and `punctuation` are de-emphasised on purpose, and holding them
   * to body contrast defeats the reason they are dim. 3:1 is a declared
   * exception rather than an oversight, and it is not an outlier: Dracula's
   * comment is 3.03:1 and Solarized Dark's is 2.79:1, with 6 of its 10 roles
   * below AA. The alternative — a comment as loud as the code it annotates —
   * is worse for the reader than a ratio a checker dislikes.
   */
  syntaxQuiet: 3,
  borderStrong: 3,
  borderDefault: 3,
  borderSubtle: 1.4,
  /**
   * A modal's dialog against the scrimmed page behind it. Not an accessibility
   * threshold — an assertion that the scrim does the one job it exists for.
   */
  overlaySeparation: 3,
} as const;

/** Syntax roles held to the body-copy bar. */
const SYNTAX_EMPHASIS_ROLES = [
  'keyword',
  'string',
  'number',
  'function',
  'type',
  'variable',
] as const satisfies readonly SyntaxRole[];

/** Syntax roles held to the de-emphasis bar. See `MINIMUM_RATIO.syntaxQuiet`. */
const SYNTAX_QUIET_ROLES = ['comment', 'punctuation'] as const satisfies readonly SyntaxRole[];

export interface ContrastCheck {
  level: ThemeLevel;
  /** e.g. `text.muted on surface.raised`. */
  pair: string;
  foreground: string;
  background: string;
  ratio: number;
  minimum: number;
  passes: boolean;
}

/**
 * Every pair worth asserting, for every level.
 *
 * Text, accents and intents are checked against `base`, `raised` *and*
 * `sunken`, because a component is free to sit on any of the three and a token
 * that only works on the page ground is a bug waiting for the first card.
 *
 * The ladder is passed in rather than imported so this module is pure colour
 * arithmetic over data — it can audit a consumer's own overrides, and it stays
 * runnable from a plain Node script with no bundler in the path.
 */
export function auditContrast(
  ladder: Readonly<Record<ThemeLevel, LevelDefinition>>,
): ContrastCheck[] {
  const results: ContrastCheck[] = [];

  for (const [level, def] of Object.entries(ladder) as [ThemeLevel, LevelDefinition][]) {
    const grounds = [
      ['surface.base', def.surface.base],
      ['surface.raised', def.surface.raised],
      ['surface.sunken', def.surface.sunken],
    ] as const;

    const check = (pair: string, foreground: string, background: string, minimum: number) => {
      const ratio = contrastRatio(foreground, background);
      results.push({
        level,
        pair,
        foreground,
        background,
        ratio,
        minimum,
        passes: ratio >= minimum,
      });
    };

    for (const [groundName, ground] of grounds) {
      for (const tone of ['primary', 'secondary', 'muted'] as const satisfies readonly TextTone[]) {
        check(`text.${tone} on ${groundName}`, def.text[tone], ground, MINIMUM_RATIO.text);
      }
      for (const tone of ['primary', 'secondary', 'tertiary', 'quiet'] as const satisfies readonly Emphasis[]) {
        check(`accent.${tone} on ${groundName}`, def.accent[tone], ground, MINIMUM_RATIO.accent);
      }
      for (const tone of ['info', 'success', 'warning', 'danger'] as const satisfies readonly Intent[]) {
        check(`intent.${tone} on ${groundName}`, def.intent[tone], ground, MINIMUM_RATIO.intent);
      }
      // Syntax roles are checked on every ground, `sunken` included — a code
      // well IS a sunken surface, and it is the darkest of the three on the
      // light rungs, so it is the one that fails first.
      for (const role of SYNTAX_EMPHASIS_ROLES) {
        check(`syntax.${role} on ${groundName}`, def.syntax[role], ground, MINIMUM_RATIO.syntax);
      }
      for (const role of SYNTAX_QUIET_ROLES) {
        check(`syntax.${role} on ${groundName}`, def.syntax[role], ground, MINIMUM_RATIO.syntaxQuiet);
      }
      check(`border.strong on ${groundName}`, def.border.strong, ground, MINIMUM_RATIO.borderStrong);
      check(`border.default on ${groundName}`, def.border.default, ground, MINIMUM_RATIO.borderDefault);
      check(`border.subtle on ${groundName}`, def.border.subtle, ground, MINIMUM_RATIO.borderSubtle);
    }

    // `text.inverse` is what a filled accent button prints in, so it is measured
    // against the accents rather than against a surface.
    for (const tone of ['primary', 'secondary', 'tertiary'] as const satisfies readonly Emphasis[]) {
      check(
        `text.inverse on accent.${tone}`,
        def.text.inverse,
        def.accent[tone],
        MINIMUM_RATIO.textInverse,
      );
    }
    for (const tone of ['info', 'success', 'warning', 'danger'] as const satisfies readonly Intent[]) {
      check(
        `text.inverse on intent.${tone}`,
        def.text.inverse,
        def.intent[tone],
        MINIMUM_RATIO.textInverse,
      );
    }
    // A scrim's job is to separate the dialog from the page behind it. Nothing
    // renders text on the scrim, so the assertion is about separation — and it
    // can be satisfied by either edge of the dialog, because this system draws
    // components with a load-bearing 2px border as often as with a fill. On a
    // dark level the fill barely differs from the scrim and the white border
    // does the work; on a light level the white fill does it and the dark
    // border is the one that disappears. Requiring both would fail every level.
    const scrimOverBase = composite(
      parseColor(def.surface.overlay),
      parseColor(def.surface.base),
    );
    const scrim = `rgb(${Math.round(scrimOverBase.r)}, ${Math.round(scrimOverBase.g)}, ${Math.round(scrimOverBase.b)})`;
    const separation = Math.max(
      contrastRatio(def.surface.raised, scrim),
      contrastRatio(def.border.strong, scrim),
    );
    results.push({
      level,
      pair: 'dialog (fill or border) against scrimmed page',
      foreground: `${def.surface.raised} / ${def.border.strong}`,
      background: scrim,
      ratio: separation,
      minimum: MINIMUM_RATIO.overlaySeparation,
      passes: separation >= MINIMUM_RATIO.overlaySeparation,
    });
  }

  return results;
}
