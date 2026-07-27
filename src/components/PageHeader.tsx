import type { ReactNode, ElementType } from 'react';

export type PageHeaderAccent = 'cyan' | 'pink' | 'yellow' | 'green';

const ACCENT_TEXT: Record<PageHeaderAccent, string> = {
  cyan: 'text-brutalist-cyan',
  pink: 'text-brutalist-pink',
  yellow: 'text-brutalist-yellow',
  green: 'text-brutalist-green',
};

export interface PageHeaderProps {
  /** Rendered bracketed + uppercased as `[ TITLE ]`. */
  title: string;
  /** Mono strapline under the title, prefixed with the `>` prompt glyph. */
  subtitle?: ReactNode;
  /** Optional leading glyph — a lucide icon or SVG component. */
  icon?: ElementType<{ className?: string }>;
  /** Themes the icon + prompt glyph. Defaults to cyan. */
  accent?: PageHeaderAccent;
  /** Extra header content (badges, admin notes) below the subtitle. */
  children?: ReactNode;
  /** Custom container class name override. */
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  accent = 'cyan',
  children,
  className = '',
}: PageHeaderProps) {
  const accentText = ACCENT_TEXT[accent] || ACCENT_TEXT.cyan;

  return (
    <header className={`bg-zinc-900 px-6 pt-8 pb-10 ${className}`}>
      <div className="mb-4 flex items-center gap-4">
        {Icon && <Icon className={`h-10 w-10 ${accentText}`} />}
        <h1 className="font-display text-4xl font-bold uppercase text-white md:text-6xl">
          [ {title} ]
        </h1>
      </div>
      {subtitle && (
        <p className="mt-4 font-mono text-lg text-zinc-400">
          <span className={accentText}>&gt;</span> {subtitle}
        </p>
      )}
      {children}
    </header>
  );
}

export default PageHeader;
