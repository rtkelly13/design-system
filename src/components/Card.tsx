import type { ReactNode, HTMLAttributes, CSSProperties } from 'react';

export type CardAccent = 'cyan' | 'pink' | 'yellow' | 'green';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  imgSrc?: string;
  href?: string;
  asciiArt?: string;
  filename?: string;
  children?: ReactNode;
  className?: string;
  /** Accent color for left border highlight */
  accent?: CardAccent;
  /** Badge text shown in the card header */
  badge?: string;
  /** If true, renders as a simple panel without the filename header bar */
  panel?: boolean;
}

const ACCENT_COLORS: Record<CardAccent, string> = {
  cyan: 'var(--brutalist-cyan, #22d3ee)',
  pink: 'var(--brutalist-pink, #ec4899)',
  yellow: 'var(--brutalist-yellow, #facc15)',
  green: 'var(--brutalist-neonGreen, #39ff14)',
};

export function Card({
  title,
  description,
  imgSrc,
  href,
  asciiArt,
  filename,
  children,
  className = '',
  accent,
  badge,
  panel = false,
  style,
  ...props
}: CardProps) {
  const accentColor = accent ? ACCENT_COLORS[accent] : undefined;

  const baseCardStyle: CSSProperties = {
    backgroundColor: 'var(--color-black, #000000)',
    color: 'var(--color-white, #ffffff)',
    border: '2px solid var(--border-color, #ffffff)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
    ...(accentColor ? { borderLeftWidth: '4px', borderLeftColor: accentColor } : {}),
    ...style,
  };

  // Simple panel mode: no filename header, no width constraints
  if (panel || (!title && children)) {
    return (
      <div
        className={`brutalist-card-panel ${className}`.trim()}
        style={{ ...baseCardStyle, padding: '1.5rem' }}
        {...props}
      >
        {badge && (
          <span
            style={{
              display: 'inline-block',
              padding: '0.15rem 0.5rem',
              fontSize: '0.65rem',
              fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#000',
              backgroundColor: accentColor || 'var(--brutalist-pink, #ec4899)',
              marginBottom: '0.75rem',
            }}
          >
            {badge}
          </span>
        )}
        {title && (
          <h3
            style={{
              fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif',
              fontSize: '1.1rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: accentColor || 'var(--color-white, #ffffff)',
              marginBottom: '0.75rem',
              letterSpacing: '0.025em',
            }}
          >
            {title}
          </h3>
        )}
        {description && (
          <p style={{ fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', fontSize: '0.85rem', color: 'var(--color-white, #ffffff)', opacity: 0.9, lineHeight: 1.6 }}>
            {description}
          </p>
        )}
        {children}
      </div>
    );
  }

  // Full card mode with filename header bar (blog/project card style)
  const computedFilename = filename || (title ? `${title.toLowerCase().replace(/\s+/g, '_')}.md` : 'card.md');

  return (
    <div className={`p-4 md:w-1/2 style-card-wrap ${className}`.trim()} style={{ maxWidth: '544px' }} {...props}>
      <div
        style={{
          height: '100%',
          ...baseCardStyle,
        }}
      >
        <div
          style={{
            borderBottom: '2px solid var(--border-color, #ffffff)',
            padding: '0.5rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--color-black, #000000)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace',
              fontSize: '0.85rem',
              color: 'var(--brutalist-yellow, #facc15)',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            {computedFilename}
          </span>
          {asciiArt && (
            <pre style={{ fontSize: '0.7rem', color: 'var(--brutalist-cyan, #22d3ee)', lineHeight: 1 }}>
              {asciiArt}
            </pre>
          )}
        </div>

        {imgSrc && (
          <div style={{ borderBottom: '2px solid var(--border-color, #ffffff)' }}>
            {href ? (
              <a href={href} aria-label={`Link to ${title || 'card'}`}>
                <img
                  alt={title || 'Card Image'}
                  src={imgSrc}
                  style={{ objectFit: 'cover', objectPosition: 'center', width: '100%', maxHeight: '192px' }}
                />
              </a>
            ) : (
              <img
                alt={title || 'Card Image'}
                src={imgSrc}
                style={{ objectFit: 'cover', objectPosition: 'center', width: '100%', maxHeight: '192px' }}
              />
            )}
          </div>
        )}

        <div style={{ padding: '1.5rem' }}>
          {title && (
            <h2
              style={{
                marginBottom: '0.75rem',
                fontSize: '1.5rem',
                fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif',
                fontWeight: 700,
                lineHeight: 1.3,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                color: 'var(--color-white, #ffffff)',
              }}
            >
              {href ? (
                <a href={href} aria-label={`Link to ${title}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {title}
                </a>
              ) : (
                title
              )}
            </h2>
          )}
          {description && (
            <p style={{ marginBottom: '0.75rem', fontFamily: 'var(--font-inter, "Inter"), sans-serif', fontSize: '0.9rem', color: 'var(--color-white, #ffffff)', opacity: 0.7, lineHeight: 1.6 }}>
              {description}
            </p>
          )}
          {children}
          {href && (
            <a
              href={href}
              style={{
                fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace',
                fontWeight: 700,
                color: 'var(--brutalist-cyan, #22d3ee)',
                textDecoration: 'none',
                textTransform: 'uppercase',
                display: 'inline-block',
                transition: 'transform 0.15s ease',
              }}
              aria-label={`Link to ${title || 'details'}`}
            >
              [ Learn More &rarr; ]
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default Card;
