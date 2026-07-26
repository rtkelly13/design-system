import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  accent?: 'cyan' | 'pink' | 'yellow' | 'green';
}

export const Badge: React.FC<BadgeProps> = ({ children, accent = 'cyan', className = '', style, ...props }) => {
  const getAccentColor = () => {
    switch (accent) {
      case 'pink': return 'var(--brutalist-pink, #ec4899)';
      case 'yellow': return 'var(--brutalist-yellow, #facc15)';
      case 'green': return 'var(--brutalist-neonGreen, #39ff14)';
      default: return 'var(--brutalist-cyan, #22d3ee)';
    }
  };

  return (
    <span className={`brutalist-badge ${className}`} style={{ color: getAccentColor(), ...style }} {...props}>
      {children}
    </span>
  );
};
