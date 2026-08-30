import type { ReactNode, HTMLAttributes } from 'react';
import { BracketText } from './BracketText';

export interface PageTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** The title text. Uppercased by the type scale, so write it in normal case. */
  children: ReactNode;
  /**
   * A line of mono text below the rule, in the primary accent. Deck copy, a
   * date, a one-line summary — it sits outside the `<h1>`, so it is not part of
   * the document outline and will not appear in a table of contents.
   */
  subtitle?: string;
  /**
   * Wrap the title in `[ BRACKETS ]`. On by default, because this is the
   * component that sets the page's voice. Turn it off where the title is a
   * proper noun that brackets would make look like a placeholder.
   */
  bracketed?: boolean;
  /** Extra classes on the `<h1>` itself, not on the wrapper. */
  className?: string;
}

/**
 * The `<h1>` for a page: double-ruled box, display face, bracketed by default.
 *
 * One per page. It is deliberately heavier than anything `PageHeader` or
 * `AnchorHeading` produce, and that weight is what makes it read as the top of
 * the document rather than as a section — so a second one on the same page
 * costs the first its meaning, and an `<h1>` used for a section costs the
 * document its outline.
 *
 * Reach for `PageHeader` instead when the heading needs to sit in a row with
 * actions, an icon or a badge; this one is the title alone.
 *
 * ```tsx
 * <PageTitle subtitle="Four rungs, one attribute">Theme ladder</PageTitle>
 * <PageTitle bracketed={false}>ryankelly.dev</PageTitle>
 * ```
 */
export function PageTitle({
  children,
  subtitle,
  bracketed = true,
  className = '',
  ...props
}: PageTitleProps) {
  const baseClasses =
    'text-3xl font-display font-bold leading-tight tracking-tight text-[var(--ds-text-primary)] uppercase sm:text-4xl md:text-5xl border-4 border-double border-[var(--ds-border-strong)] inline-block px-6 py-4';

  return (
    <div className="mb-8">
      <h1 className={`${baseClasses} ${className}`.trim()} {...props}>
        {bracketed ? <BracketText>{children}</BracketText> : children}
      </h1>
      {subtitle && (
        <p className="mt-2 font-mono text-sm text-accent-primary">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default PageTitle;
