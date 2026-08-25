import type { ReactNode, HTMLAttributes } from 'react';
import type { AccentToken } from '../lib/theme';

export interface BracketTextProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  /** Semantic emphasis. Legacy palette names still resolve identically. */
  accent?: AccentToken | 'white';
  className?: string;
}

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
