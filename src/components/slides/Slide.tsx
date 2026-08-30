import React from 'react';

export interface SlideProps {
  /** Slide heading, above a rule. Omit it for a full-bleed or title-card slide. */
  title?: string;
  /** A line under the title, in the primary accent. */
  subtitle?: string;
  /** The slide body, laid out between the header and the foot of the frame. */
  children: React.ReactNode;
  /**
   * Presenter notes.
   *
   * Accepted and **not rendered anywhere** — there is no presenter view in this
   * package yet, and `SlideDeck` does not read it either. It is here so decks
   * can carry their notes with the content rather than in a separate document,
   * and so adding a presenter view later does not change every call site. Do
   * not put anything in it that must reach the audience.
   */
  speakerNotes?: string;
}

/**
 * One slide: a full-bleed frame with a ruled header and a body.
 *
 * It fills its container rather than sizing itself, which is what lets
 * `SlideDeck` own the aspect ratio and the fullscreen behaviour. Rendered on
 * its own it will fill whatever box you put it in, so give it one.
 *
 * The frame is a surface, not a page — it paints `--ds-surface-base` and
 * inherits the level, so a deck rethemes with the rest of the site rather than
 * being pinned to a presentation palette.
 *
 * ```tsx
 * <SlideDeck>
 *   <Slide title="One stack, three modes" subtitle="Adopt, do not manage">
 *     <ul>…</ul>
 *   </Slide>
 * </SlideDeck>
 * ```
 */
export const Slide: React.FC<SlideProps> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '3rem 4rem',
        backgroundColor: 'var(--ds-surface-base)',
        color: 'var(--ds-text-primary)',
        boxSizing: 'border-box',
      }}
    >
      {/* Slide Header */}
      {title && (
        <div style={{ marginBottom: '2rem', borderBottom: '2px solid var(--ds-border-strong)', paddingBottom: '1rem' }}>
          <h2
            style={{
              fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif',
              fontSize: '2.5rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              color: 'var(--ds-text-primary)',
              margin: 0,
            }}
          >
            [ {title} ]
          </h2>
          {subtitle && (
            <p
              style={{
                fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace',
                fontSize: '1rem',
                color: 'var(--ds-accent-primary)',
                marginTop: '0.5rem',
              }}
            >
              &gt; {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Slide Content Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {children}
      </div>

      {/* Slide Footer Branding */}
      <div
        style={{
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: '2px solid var(--ds-border-strong)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace',
          fontSize: '0.75rem',
          color: 'var(--ds-accent-primary)',
        }}
      >
        <span>// BRUTALIST PRESENTATION ENGINE //</span>
        <span>RYANKELLY.DEV</span>
      </div>
    </div>
  );
};
