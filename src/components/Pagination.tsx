import type { ReactNode } from 'react';
import { cn } from '../lib/recipe';

export interface PaginationProps {
  /** Total number of pages. The control disables `NEXT` once `currentPage` reaches it. */
  totalPages: number;
  /** The current page, **1-based** — not a zero-based index. */
  currentPage: number;
  /**
   * Handler for the button form. Receives the page to move to, already
   * bounds-checked, so no clamping is needed at the call site.
   */
  onPageChange?: (page: number) => void;
  /**
   * Maps a page number to a URL. Supplying it switches the control to real
   * anchors, which is the right form for a paginated *document* — the reader
   * gets middle-click, a copyable address and a crawlable archive. Prefer this
   * over `onPageChange` wherever the page has a URL.
   */
  getPageHref?: (page: number) => string;
  /** Extra classes on the `<nav>` wrapper. */
  className?: string;
}

/**
 * Previous / next paging with the current position between them.
 *
 * Two forms, chosen by which callback you pass. `getPageHref` renders anchors;
 * `onPageChange` renders buttons. The anchor form is the better default for
 * anything with an address — a blog archive, a docs list — and the button form
 * is for state that lives only in the client, like a filtered table.
 *
 * Pages are **1-based**, which is the one thing to get right at the call site:
 * a zero-based index renders `PAGE 0 OF 10` and disables `PREV` a page early.
 * Both ends disable rather than disappear, so the control does not change width
 * as the reader moves through it.
 *
 * ```tsx
 * <Pagination currentPage={2} totalPages={7} getPageHref={(p) => `/blog/page/${p}`} />
 * <Pagination currentPage={page} totalPages={pages} onPageChange={setPage} />
 * ```
 */
export function Pagination({
  totalPages,
  currentPage,
  onPageChange,
  getPageHref,
  className = '',
}: PaginationProps) {
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const prevPageNum = currentPage - 1;
  const nextPageNum = currentPage + 1;

  const handlePrevClick = () => {
    if (hasPrev && onPageChange) {
      onPageChange(prevPageNum);
    }
  };

  const handleNextClick = () => {
    if (hasNext && onPageChange) {
      onPageChange(nextPageNum);
    }
  };

  const activeBtnClasses =
    'border-2 border-edge-strong text-content-inverse px-6 py-3 font-bold uppercase shadow-hard-md hover:shadow-hard-lg active:translate-x-1 active:translate-y-1 active:shadow-none transition-all';
  const disabledBtnClasses =
    'cursor-not-allowed opacity-50 border-2 border-edge-strong bg-surface-raised text-content-primary px-6 py-3 font-bold uppercase';

  const renderPrevButton = (): ReactNode => {
    if (!hasPrev) {
      return (
        <button className={disabledBtnClasses} disabled aria-label="Previous Page">
          &lt;&lt; PREV
        </button>
      );
    }

    if (getPageHref) {
      return (
        <a href={getPageHref(prevPageNum)} className={cn(activeBtnClasses, 'bg-accent-primary')}>
          &lt;&lt; PREV
        </a>
      );
    }

    return (
      <button
        onClick={handlePrevClick}
        className={cn(activeBtnClasses, 'bg-accent-primary')}
        aria-label="Previous Page"
      >
        &lt;&lt; PREV
      </button>
    );
  };

  const renderNextButton = (): ReactNode => {
    if (!hasNext) {
      return (
        <button className={disabledBtnClasses} disabled aria-label="Next Page">
          NEXT &gt;&gt;
        </button>
      );
    }

    if (getPageHref) {
      return (
        <a href={getPageHref(nextPageNum)} className={cn(activeBtnClasses, 'bg-accent-tertiary')}>
          NEXT &gt;&gt;
        </a>
      );
    }

    return (
      <button
        onClick={handleNextClick}
        className={cn(activeBtnClasses, 'bg-accent-tertiary')}
        aria-label="Next Page"
      >
        NEXT &gt;&gt;
      </button>
    );
  };

  return (
    <div className={cn('pt-6 pb-8 space-y-2 md:space-y-5', className)}>
      <nav className="flex justify-between items-center font-mono" aria-label="Pagination Navigation">
        {renderPrevButton()}
        <span className="text-content-primary font-bold border-2 border-edge-strong px-6 py-3 bg-surface-base">
          [ {currentPage} / {totalPages} ]
        </span>
        {renderNextButton()}
      </nav>
    </div>
  );
}

export default Pagination;
