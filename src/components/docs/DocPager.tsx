import { ArrowLeft, ArrowRight } from 'lucide-react';
import { DocsLink } from './DocsLinkProvider';

export interface DocPagerTarget {
  /** The adjacent page's title — the thing a sequential reader is actually looking for. */
  label: string;
  /** Its URL. Routed through `DocsLink`, so a host router handles it if one is provided. */
  href: string;
}

export interface DocPagerProps {
  /** The previous page. Omit on the first page; the slot collapses to a spacer. */
  prev?: DocPagerTarget;
  /** The next page. Omit on the last page. */
  next?: DocPagerTarget;
  /** Extra classes on the `<nav>`. */
  className?: string;
}

/**
 * Titled previous/next navigation for the foot of a documentation page.
 *
 * Distinct from {@link Pagination}, which counts numbered pages (`[ 3 / 12 ]`)
 * for list views. Readers moving through docs sequentially need the *name* of
 * the adjacent page, not its index.
 *
 * Renders an empty spacer when only one side exists so `next` stays
 * right-aligned on a page with no predecessor.
 */
export function DocPager({ prev, next, className = '' }: DocPagerProps) {
  if (!prev && !next) return null;

  return (
    <nav className={`not-prose docs-pager ${className}`.trim()} aria-label="Page navigation">
      {prev ? (
        <DocsLink href={prev.href} className="docs-pager-link" rel="prev">
          <span className="docs-pager-dir">
            <ArrowLeft size={13} aria-hidden="true" /> PREVIOUS
          </span>
          <span className="docs-pager-label">{prev.label}</span>
        </DocsLink>
      ) : (
        <span aria-hidden="true" />
      )}

      {next ? (
        <DocsLink href={next.href} className="docs-pager-link docs-pager-next" rel="next">
          <span className="docs-pager-dir">
            NEXT <ArrowRight size={13} aria-hidden="true" />
          </span>
          <span className="docs-pager-label">{next.label}</span>
        </DocsLink>
      ) : (
        <span aria-hidden="true" />
      )}
    </nav>
  );
}

export default DocPager;
