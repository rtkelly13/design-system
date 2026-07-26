import React from 'react';

export interface BracketTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  accent?: 'cyan' | 'pink' | 'yellow' | 'green' | 'white';
}

export const BracketText: React.FC<BracketTextProps> = ({
  children,
  accent = 'cyan',
  className = '',
  style,
  ...props
}) => {
  const getAccentColor = () => {
    switch (accent) {
      case 'pink': return 'var(--brutalist-pink, #ec4899)';
      case 'yellow': return 'var(--brutalist-yellow, #facc15)';
      case 'green': return 'var(--brutalist-neonGreen, #39ff14)';
      case 'white': return 'var(--color-white, #ffffff)';
      default: return 'var(--brutalist-cyan, #22d3ee)';
    }
  };

  return (
    <span
      className={className}
      style={{
        fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif',
        fontWeight: 700,
        textTransform: 'uppercase',
        color: getAccentColor(),
        ...style
      }}
      {...props}
    >
      [ {children} ]
    </span>
  );
};
