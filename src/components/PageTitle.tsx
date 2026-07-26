import React from 'react';

export interface PageTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  subtitle?: string;
  bracketed?: boolean;
}

export const PageTitle: React.FC<PageTitleProps> = ({
  children,
  subtitle,
  bracketed = true,
  className = '',
  style,
  ...props
}) => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h1
        className={className}
        style={{
          fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif',
          fontSize: '2.25rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '-0.02em',
          color: 'var(--color-white, #ffffff)',
          ...style
        }}
        {...props}
      >
        {bracketed ? `[ ${children} ]` : children}
      </h1>
      {subtitle && (
        <p style={{ fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', fontSize: '0.875rem', color: 'var(--brutalist-cyan, #22d3ee)', marginTop: '0.5rem' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
};
