import React from 'react';
import { accentVar } from '../lib/theme';
import type { AccentToken } from '../lib/theme';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  /**
   * Semantic role. Accepts an `Emphasis` (`primary`…`quiet`) or an `Intent`
   * (`info`/`success`/`warning`/`danger`); the legacy palette names still
   * resolve to the same values.
   */
  accent?: AccentToken;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  accent = 'primary',
  className = '',
  style,
  ...props
}) => {
  return (
    <span
      className={`brutalist-badge ${className}`}
      style={{ color: accentVar(accent), ...style }}
      {...props}
    >
      {children}
    </span>
  );
};
