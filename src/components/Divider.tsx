import React from 'react';
import { LEVELS, DEFAULT_LEVEL } from '../theme/levels';
import type { Polarity } from '../theme/levels';
import { useOptionalTheme } from './ThemeProvider';

/**
 * A rule drawn in characters rather than pixels.
 *
 * The glyph is part of the design, and it is not the same glyph on every level.
 * The dark end of the ladder leans on terminal devices — scanlines, `>`
 * prompts, `//====//` rules. The light end is paper, where the equivalent
 * device is a hand-ruled pencil dash. Same component, same role, different
 * mark.
 *
 * ## Why this exists as its own component
 *
 * That behaviour used to live in the *consumer's* stylesheet, as
 * `.sketch .ascii-divider::after { content: "· ─ ─ ·" }` in the blog, overriding
 * a `::after` in the design system. Three things were wrong with that:
 *
 *   - The design intent — "this rule is drawn differently on paper" — was
 *     stated in a downstream repo, so the system did not actually own its own
 *     divider.
 *   - It keyed off `.sketch`, a level name that no longer exists. Anything
 *     built that way silently stops matching when the ladder changes, because
 *     a selector that matches nothing fails quietly.
 *   - It forced the design system to keep a bare `.ascii-divider` class as a
 *     styling hook purely so a pseudo-element had something to attach to,
 *     which was the last hole in the styling-lives-in-TSX rule.
 *
 * Encoding it here closes all three: the mapping is a `Record<Polarity, …>`, so
 * it is exhaustive by type, and the glyph is real text rather than generated
 * content — which means it is selectable, searchable, and readable by a screen
 * reader if it ever needed to be (it is `aria-hidden`, being decoration).
 */

/** Which mark to draw. `auto` follows the current level's polarity. */
export type DividerVariant = 'auto' | 'terminal' | 'pencil';

/**
 * The mark each polarity draws.
 *
 * A `Record<Polarity, …>` rather than a conditional, for the same reason the
 * rest of the ladder is: a third polarity would be a compile error here rather
 * than a silent fallthrough.
 */
export const DIVIDER_PATTERNS: Readonly<Record<Polarity, string>> = {
  dark: '//====================================================//',
  light: '· ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ·',
};

const VARIANT_POLARITY: Readonly<Record<Exclude<DividerVariant, 'auto'>, Polarity>> = {
  terminal: 'dark',
  pencil: 'light',
};

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Which mark to draw. Defaults to `auto`, which follows the level's declared
   * polarity — terminal on `midnight`/`dim`, pencil on `bright`/`white`.
   */
  variant?: DividerVariant;
  /** An explicit mark, overriding both the variant and the level. */
  pattern?: string;
  /** Extra classes on the rule — vertical margin usually. */
  className?: string;
}

/**
 * A horizontal rule drawn in characters rather than pixels.
 *
 * The mark is not the same on every rung of the ladder. The dark rungs are a
 * terminal, so the rule is `//====//`; the light rungs are paper, so it is a
 * pencil dash. `auto` — the default — reads the current level's declared
 * polarity and picks, which means a page that changes theme changes its rules
 * with it and no call site has to know.
 *
 * Force a mark with `variant` only when the surrounding content is fixed in one
 * idiom regardless of theme; `pattern` overrides both and is an escape hatch,
 * not a styling channel.
 *
 * The glyph is real text rather than generated content, and it is
 * `aria-hidden`: decoration a screen reader should not read out, but which is
 * still selectable and searchable, which a `::after` would not be. It clips
 * rather than ellipsising in a narrow container — an ellipsis on a rule reads
 * as a broken string.
 *
 * `AsciiDivider` is a deprecated alias of this component and has no story of
 * its own, deliberately: a story is a recommendation.
 *
 * ```tsx
 * <Divider />
 * <Divider variant="pencil" />
 * ```
 */
export const Divider: React.FC<DividerProps> = ({
  variant = 'auto',
  pattern,
  className = '',
  ...props
}) => {
  // Optional on purpose: a divider must still draw something sensible in a
  // story with no decorator, or under a consumer that sets `data-theme` on the
  // document and never mounts a provider.
  const theme = useOptionalTheme();
  const polarity =
    variant === 'auto'
      ? (theme?.polarity ?? LEVELS[DEFAULT_LEVEL].polarity)
      : VARIANT_POLARITY[variant];

  return (
    <div
      className={`font-mono text-accent-primary tracking-[0.2em] select-none my-6 overflow-hidden whitespace-nowrap ${className}`.trim()}
      // Clipped, not truncated: an ellipsis on a rule reads as a broken string.
      // The mark is decoration, so losing its tail to a narrow container is
      // correct and `aria-hidden` keeps it out of the accessibility tree.
      aria-hidden="true"
      {...props}
    >
      {pattern ?? DIVIDER_PATTERNS[polarity]}
    </div>
  );
};

export default Divider;
