import type { ReactNode, HTMLAttributes, CSSProperties } from 'react';
import { accentVar, semanticTokens } from '../lib/theme';
import type { AccentToken } from '../lib/theme';

/** @deprecated Use {@link AccentToken}. Retained for existing call sites. */
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
  /** Semantic accent for the left border highlight. */
  accent?: AccentToken;
  /** Badge text shown in the card header */
  badge?: string;
  /** If true, renders as a simple panel without the filename header bar */
  panel?: boolean;
}

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
  const accentColor = accent ? accentVar(accent) : undefined;

  const baseCardStyle: CSSProperties = {
    backgroundColor: semanticTokens.surface.base,
    color: semanticTokens.text.primary,
    border: `2px solid ${semanticTokens.border.strong}`,
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
              fontFamily: semanticTokens.font.mono,
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#000',
              backgroundColor: accentColor ?? semanticTokens.accent.tertiary,
              marginBottom: '0.75rem',
            }}
          >
            {badge}
          </span>
        )}
        {title && (
          <h3
            style={{
              fontFamily: semanticTokens.font.display,
              fontSize: '1.1rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: accentColor || semanticTokens.text.primary,
              marginBottom: '0.75rem',
              letterSpacing: '0.025em',
            }}
          >
            {title}
          </h3>
        )}
        {description && (
          <p style={{ fontFamily: semanticTokens.font.mono, fontSize: '0.85rem', color: semanticTokens.text.primary, opacity: 0.9, lineHeight: 1.6 }}>
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
            borderBottom: `2px solid ${semanticTokens.border.strong}`,
            padding: '0.5rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: semanticTokens.surface.base,
          }}
        >
          <span
            style={{
              fontFamily: semanticTokens.font.mono,
              fontSize: '0.85rem',
              color: semanticTokens.accent.secondary,
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            {computedFilename}
          </span>
          {asciiArt && (
            <pre style={{ fontSize: '0.7rem', color: semanticTokens.accent.primary, lineHeight: 1 }}>
              {asciiArt}
            </pre>
          )}
        </div>

        {imgSrc && (
          <div style={{ borderBottom: `2px solid ${semanticTokens.border.strong}` }}>
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
                fontFamily: semanticTokens.font.display,
                fontWeight: 700,
                lineHeight: 1.3,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                color: semanticTokens.text.primary,
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
            <p style={{ marginBottom: '0.75rem', fontFamily: semanticTokens.font.body, fontSize: '0.9rem', color: semanticTokens.text.primary, opacity: 0.7, lineHeight: 1.6 }}>
              {description}
            </p>
          )}
          {children}
          {href && (
            <a
              href={href}
              style={{
                fontFamily: semanticTokens.font.mono,
                fontWeight: 700,
                color: semanticTokens.accent.primary,
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
