import type { ReactNode, HTMLAttributes } from 'react';
import type { AccentToken } from '../lib/theme';

export interface BracketTextProps extends HTMLAttributes<HTMLSpanElement> {
  /** The text to enclose. The brackets are added around it, not by the caller. */
  children: ReactNode;
  /**
   * Semantic emphasis, applied to the brackets and the text together. Legacy
   * palette names still resolve identically. `'white'` is the maximum-contrast
   * option and resolves to `--ds-text-primary`, so it inverts at the light end
   * of the ladder rather than staying literally white.
   *
   * Omit it to inherit the surrounding text colour, which is usually right
   * inline in a paragraph.
   */
  accent?: AccentToken | 'white';
  /** Extra classes on the wrapping span. Merged, so a caller's colour wins. */
  className?: string;
}

/**
 * Text wrapped in the system's `[ BRACKETS ]`.
 *
 * The brackets are the house display convention, and putting them in a
 * component rather than typing them is what makes them consistent: the spacing
 * is a real space either side, and each glyph is `aria-hidden`, so a screen
 * reader announces "SYSTEM READY" rather than "left square bracket SYSTEM
 * READY right square bracket". Hand-typed brackets get that wrong every time.
 *
 * It is a `<span>` and styles nothing but colour, so it composes inside a
 * heading, a button label or running prose without fighting the type scale it
 * lands in — `PageTitle` and `Button` both use it internally for exactly that
 * reason.
 *
 * ```tsx
 * <BracketText accent="primary">SYSTEM READY</BracketText>
 * <p>Status is <BracketText accent="success">NOMINAL</BracketText> as of 14:02.</p>
 * ```
 */
export function BracketText({
  children,
  accent,
  className = '',
  ...props
}: BracketTextProps) {
  const accentClasses: Record<string, string> = {
    primary: 'text-accent-primary',
    secondary: 'text-accent-secondary',
    tertiary: 'text-accent-tertiary',
    quiet: 'text-accent-quiet',
    info: 'text-intent-info',
    success: 'text-intent-success',
    warning: 'text-intent-warning',
    danger: 'text-intent-danger',
    cyan: 'text-accent-primary',
    pink: 'text-accent-tertiary',
    yellow: 'text-accent-secondary',
    green: 'text-intent-success',
    white: 'text-content-primary',
  };

  const accentClass = accent ? accentClasses[accent] : '';

  return (
    <span className={`${accentClass} ${className}`.trim()} {...props}>
      <span aria-hidden="true">
        [
      </span>{' '}
      {children}{' '}
      <span aria-hidden="true">
        ]
      </span>
    </span>
  );
}

export default BracketText;
