import { accentVar } from '../lib/theme';
import type { AccentToken } from '../lib/theme';
import React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
  /**
   * Which accent draws the ring and the offset shadow.
   *
   * Roles are the vocabulary: `primary`, `secondary`, `tertiary`, `quiet`, and
   * the four intents. The four hue names are **deprecated aliases** kept so
   * existing call sites do not break — they resolve to exactly the role they
   * always did, so nothing renders differently.
   *
   * The hue names also mislead now that `palette` exists. On `sketch`,
   * `accent="cyan"` renders `#1450d7` — blue — because it was never asking for
   * cyan, it was asking for the primary accent. Use the role.
   */
  accent?: AccentToken;
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

  // `accentVar` already owns the role and legacy-alias resolution, including
  // the deprecated hue names. Duplicating it here as a switch is how the two
  // drifted before: a role added to the token layer rendered as `primary` in
  // this component and nowhere else, silently.
  const accentColor = accentVar(accent);

  const sizePx = getSizePx();

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
