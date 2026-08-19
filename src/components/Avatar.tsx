import React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
  accent?: 'cyan' | 'pink' | 'yellow' | 'green';
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  fallback = 'RK',
  size = 'md',
  accent = 'cyan',
  className = '',
  style,
  ...props
}) => {
  const getSizePx = () => {
    switch (size) {
      case 'sm': return '32px';
      case 'lg': return '56px';
      default: return '44px';
    }
  };

  const getAccentColor = () => {
    switch (accent) {
      case 'pink': return 'var(--ds-accent-tertiary)';
      case 'yellow': return 'var(--ds-accent-secondary)';
      case 'green': return 'var(--ds-intent-success)';
      default: return 'var(--ds-accent-primary)';
    }
  };

  const sizePx = getSizePx();
  const accentColor = getAccentColor();

  return (
    <div
      className={className}
      style={{
        width: sizePx,
        height: sizePx,
        border: '2px solid var(--ds-border-strong)',
        boxShadow: `3px 3px 0px 0px ${accentColor}`,
        backgroundColor: 'var(--ds-surface-base)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxSizing: 'border-box',
        ...style
      }}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span
          style={{
            fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif',
            fontWeight: 800,
            fontSize: size === 'sm' ? '0.75rem' : size === 'lg' ? '1.2rem' : '0.95rem',
            color: accentColor,
            textTransform: 'uppercase',
          }}
        >
          {fallback}
        </span>
      )}
    </div>
  );
};
