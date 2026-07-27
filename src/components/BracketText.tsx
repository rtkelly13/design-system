import type { ReactNode, HTMLAttributes } from 'react';

export interface BracketTextProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  accent?: 'cyan' | 'pink' | 'yellow' | 'green' | 'white';
  className?: string;
}

export function BracketText({
  children,
  accent,
  className = '',
  ...props
}: BracketTextProps) {
  const accentClasses: Record<string, string> = {
    cyan: 'text-brutalist-cyan',
    pink: 'text-brutalist-pink',
    yellow: 'text-brutalist-yellow',
    green: 'text-brutalist-green',
    white: 'text-white',
  };

  const accentClass = accent ? accentClasses[accent] : '';

  return (
    <span className={`${accentClass} ${className}`.trim()} {...props}>
      <span className="bracket-glyph" aria-hidden="true">
        [
      </span>{' '}
      {children}{' '}
      <span className="bracket-glyph" aria-hidden="true">
        ]
      </span>
    </span>
  );
}

export default BracketText;
