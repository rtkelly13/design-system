import type { ReactNode, HTMLAttributes } from 'react';
import type { AccentToken } from '../lib/theme';
import { cn } from '../lib/recipe';

export interface BracketTextProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  /**
   * Semantic emphasis. Roles only — `'white'` was still accepted here after
   * #138 removed the hue vocabulary from the component API, because the union
   * named it explicitly and the class map was typed `Record<string, string>`.
   * An appearance name in a component API is the defect ADR 0001 exists to
   * prevent; omit `accent` for the default ink.
   */
  accent?: AccentToken;
  className?: string;
}

export function BracketText({
  children,
  accent,
  className = '',
  ...props
}: BracketTextProps) {
  const accentClasses: Record<AccentToken, string> = {
    primary: 'text-accent-primary',
    secondary: 'text-accent-secondary',
    tertiary: 'text-accent-tertiary',
    quiet: 'text-accent-quiet',
    info: 'text-intent-info',
    success: 'text-intent-success',
    warning: 'text-intent-warning',
    danger: 'text-intent-danger',
  };

  const accentClass = accent ? accentClasses[accent] : '';

  return (
    <span className={cn(accentClass, className)} {...props}>
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
