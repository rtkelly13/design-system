import React from 'react';
import { accentVar } from '../lib/theme';
import type { AccentToken } from '../lib/theme';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * The label. Short and uppercase by convention — the face is mono at
   * `0.75rem`, so a badge is a word or two, not a sentence.
   */
  children: React.ReactNode;
  /**
   * Semantic role. Accepts an `Emphasis` (`primary`…`quiet`) or an `Intent`
   * (`info`/`success`/`warning`/`danger`); the legacy palette names still
   * resolve to the same values.
   */
  accent?: AccentToken;
  /** Extra classes on the pill. */
  className?: string;
}

/**
 * A bordered pill for a short piece of state — a version, a status, a count.
 *
 * The whole decision when using one is `accent`, and it is the
 * `Emphasis`/`Intent` split the token layer is built on. An `Emphasis`
 * (`primary`…`quiet`) says *how much this should catch the eye*; an `Intent`
 * (`info`/`success`/`warning`/`danger`) says *what the reader must conclude*.
 * A build that failed is `danger` regardless of how prominent the page wants
 * it to be, and a "NEW" flash is `primary` regardless of whether anything is
 * wrong. Picking an emphasis because it happens to be red is how a design
 * system loses the ability to restate meaning in a new palette.
 *
 * Colour is the only channel a `Badge` has, so it must never be the only
 * channel carrying the meaning: the text says `FAILED`, and `danger` makes it
 * louder.
 *
 * ```tsx
 * <Badge accent="success">HEALTHY</Badge>
 * <Badge accent="quiet">v1.1.0</Badge>
 * ```
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  accent = 'primary',
  className = '',
  style,
  ...props
}) => {
  return (
    <span
      className={`inline-flex items-center gap-[0.4rem] border-2 border-edge-strong bg-surface-base px-[0.6rem] py-[0.2rem] font-mono text-[0.75rem] font-bold ${className}`.trim()}
      // `text-[0.75rem]` rather than `text-xs`: the named size ships a paired
      // line-height, and the class this replaced set font-size alone so the
      // badge inherited the article's unitless 1.5. Pinning any explicit
      // leading changes the line box. The accent is a runtime value, so it
      // stays an inline custom style rather than a build-time utility.
      style={{ color: accentVar(accent), ...style }}
      {...props}
    >
      {children}
    </span>
  );
};
