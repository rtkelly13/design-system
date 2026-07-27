import type { ReactNode } from 'react';

export interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange?: (page: number) => void;
  getPageHref?: (page: number) => string;
  className?: string;
}

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
    'border-2 border-white text-black px-6 py-3 font-bold uppercase shadow-hard-md hover:shadow-hard-lg active:translate-x-1 active:translate-y-1 active:shadow-none transition-all';
  const disabledBtnClasses =
    'cursor-not-allowed opacity-50 border-2 border-white bg-zinc-900 text-white px-6 py-3 font-bold uppercase';

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
        <a href={getPageHref(prevPageNum)} className={`${activeBtnClasses} bg-brutalist-cyan`}>
          &lt;&lt; PREV
        </a>
      );
    }

    return (
      <button
        onClick={handlePrevClick}
        className={`${activeBtnClasses} bg-brutalist-cyan`}
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
        <a href={getPageHref(nextPageNum)} className={`${activeBtnClasses} bg-brutalist-pink`}>
          NEXT &gt;&gt;
        </a>
      );
    }

    return (
      <button
        onClick={handleNextClick}
        className={`${activeBtnClasses} bg-brutalist-pink`}
        aria-label="Next Page"
      >
        NEXT &gt;&gt;
      </button>
    );
  };

  return (
    <div className={`pt-6 pb-8 space-y-2 md:space-y-5 ${className}`}>
      <nav className="flex justify-between items-center font-mono" aria-label="Pagination Navigation">
        {renderPrevButton()}
        <span className="text-white font-bold border-2 border-white px-6 py-3 bg-black">
          [ {currentPage} / {totalPages} ]
        </span>
        {renderNextButton()}
      </nav>
    </div>
  );
}

export default Pagination;
