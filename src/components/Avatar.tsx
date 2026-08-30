import React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Image URL. Omit it and the `fallback` initials render instead. */
  src?: string;
  /**
   * Alternative text for `src`. Defaults to `'Avatar'`, which is worth
   * overriding whenever the identity is knowable — a screen reader announcing
   * "Avatar" three times in a contributor list has told the reader nothing.
   */
  alt?: string;
  /**
   * Initials shown when there is no image. One or two characters; the face is
   * uppercased display type and a third character starts to crowd the box at
   * `sm`.
   */
  fallback?: string;
  /** Box size: 32px, 44px or 56px. The offset shadow stays 3px at every size. */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Colour of the offset shadow and of the fallback initials.
   *
   * This one prop still takes the *legacy palette names* rather than the
   * `AccentToken` roles the rest of the package moved to — the values it
   * resolves to are the semantic variables (`cyan` is `--ds-accent-primary`),
   * so it rethemes correctly, but the vocabulary is the old one. Widening it to
   * `AccentToken` is tracked in `docs/story-documentation.md`.
   */
  accent?: 'cyan' | 'pink' | 'yellow' | 'green';
  /** Extra classes on the chip. The box size comes from `size`, not from here. */
  className?: string;
}

/**
 * A square identity chip — image if there is one, initials if there is not.
 *
 * Square, not round, and that is the system rather than an oversight: the
 * global `border-radius: 0` applies to people too. What distinguishes it from
 * any other bordered box is the 3px offset shadow in the accent colour, which
 * is the only place the accent shows when an image fills the frame.
 *
 * Sizes exist for the three contexts that actually occur — a byline (`sm`), a
 * list row (`md`) and a profile header (`lg`). There is no `xl`, because a
 * portrait at that size is an image, not an avatar.
 *
 * ```tsx
 * <Avatar fallback="RK" accent="cyan" size="lg" />
 * <Avatar src={author.photo} alt={author.name} size="sm" />
 * ```
 */
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
