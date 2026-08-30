import type { ReactNode, ElementType } from 'react';
import { cn } from '../lib/recipe';
import type { AccentToken } from '../lib/theme';

/** @deprecated Use {@link AccentToken}. Retained for existing call sites. */
export type PageHeaderAccent = 'cyan' | 'pink' | 'yellow' | 'green';

const ACCENT_TEXT: Record<string, string> = {
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
};

export interface PageHeaderProps {
  /** Rendered bracketed + uppercased as `[ TITLE ]`. */
  title: string;
  /** Mono strapline under the title, prefixed with the `>` prompt glyph. */
  subtitle?: ReactNode;
  /** Optional leading glyph — a lucide icon or SVG component. */
  icon?: ElementType<{ className?: string }>;
  /** Themes the icon + prompt glyph. Defaults to cyan. */
  accent?: AccentToken;
  /** Extra header content (badges, admin notes) below the subtitle. */
  children?: ReactNode;
  /** Custom container class name override. */
  className?: string;
}

/**
 * The banded heading at the top of a section or an application page.
 *
 * Where `PageTitle` is a title in a double-ruled box, this is a full-width band
 * on the raised surface carrying a title, an optional icon, a `>`-prompted
 * strapline and a slot for badges or actions underneath. Use it for
 * application and docs surfaces; use `PageTitle` for editorial ones.
 *
 * It renders an `<h1>` inside a `<header>`, so the same rule applies: one per
 * page. `accent` colours the icon and the prompt glyph only — the title itself
 * stays `--ds-text-primary`, which is what keeps the band readable when the
 * accent is a low-contrast role like `quiet`.
 *
 * ```tsx
 * <PageHeader title="Deployments" subtitle="Every build, newest first" icon={Rocket}>
 *   <Badge accent="success">42 HEALTHY</Badge>
 * </PageHeader>
 * ```
 */
export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  accent = 'primary',
  children,
  className = '',
}: PageHeaderProps) {
  const accentText = ACCENT_TEXT[accent] ?? ACCENT_TEXT.primary;

  return (
    <header className={cn('bg-surface-raised px-6 pt-8 pb-10', className)}>
      <div className="mb-4 flex items-center gap-4">
        {Icon && <Icon className={`h-10 w-10 ${accentText}`} />}
        <h1 className="font-display text-4xl font-bold uppercase text-content-primary md:text-6xl">
          [ {title} ]
        </h1>
      </div>
      {subtitle && (
        <p className="mt-4 font-mono text-lg text-content-muted">
          <span className={accentText}>&gt;</span> {subtitle}
        </p>
      )}
      {children}
    </header>
  );
}

export default PageHeader;
