import React from 'react';
import { Zap } from 'lucide-react';

export interface TLDRProps {
  /**
   * The summary. Body text, not display — a sentence or three, or a short list.
   * Anything longer stops being a summary and starts being the article again.
   */
  children: React.ReactNode;
}

/**
 * The summary box at the top of a long piece of writing.
 *
 * Fixed by design: no accent prop, no variants, no title override. It is always
 * the secondary accent with a 6px offset shadow and always says `[ TL;DR ]`,
 * because its whole job is to be the one element a reader recognises without
 * reading — and a recognisable element cannot also be configurable. Use
 * `NoteBlock` when the callout needs a type or a heading of its own.
 *
 * One per page, immediately after the title and before the body. A `TL;DR` that
 * appears halfway down is a section summary, which is a different thing.
 *
 * ```tsx
 * <TLDR>
 *   A custom property substitutes where it is declared, not where it is used —
 *   which is what decides whether a nested panel keeps its own theme.
 * </TLDR>
 * ```
 */
export const TLDR: React.FC<TLDRProps> = ({ children }) => {
  return (
    <div
      style={{
        margin: '2rem 0',
        padding: '1.5rem',
        border: '2px solid var(--ds-accent-secondary)',
        backgroundColor: 'var(--ds-surface-base)',
        boxShadow: '6px 6px 0px 0px var(--ds-accent-secondary)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <Zap size={20} color="var(--ds-accent-secondary)" />
        <span
          style={{
            fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif',
            fontWeight: 800,
            fontSize: '1rem',
            textTransform: 'uppercase',
            color: 'var(--ds-accent-secondary)',
          }}
        >
          [ TL;DR ]
        </span>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-inter, "Inter"), sans-serif',
          fontSize: '1rem',
          fontWeight: 500,
          color: 'var(--ds-text-primary)',
          lineHeight: 1.6,
        }}
      >
        {children}
      </div>
    </div>
  );
};
