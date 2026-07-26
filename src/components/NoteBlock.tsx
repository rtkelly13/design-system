import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export interface NoteBlockProps {
  type?: 'note' | 'tip' | 'warning' | 'important';
  title?: string;
  children: React.ReactNode;
}

export const NoteBlock: React.FC<NoteBlockProps> = ({
  type = 'note',
  title,
  children
}) => {
  const getStyle = () => {
    switch (type) {
      case 'tip':
        return {
          borderColor: 'var(--brutalist-neonGreen, #39ff14)',
          color: 'var(--brutalist-neonGreen, #39ff14)',
          icon: CheckCircle2,
          defaultTitle: 'PRO TIP'
        };
      case 'warning':
        return {
          borderColor: 'var(--brutalist-pink, #ec4899)',
          color: 'var(--brutalist-pink, #ec4899)',
          icon: AlertTriangle,
          defaultTitle: 'WARNING'
        };
      case 'important':
        return {
          borderColor: 'var(--brutalist-yellow, #facc15)',
          color: 'var(--brutalist-yellow, #facc15)',
          icon: AlertCircle,
          defaultTitle: 'IMPORTANT'
        };
      default:
        return {
          borderColor: 'var(--brutalist-cyan, #22d3ee)',
          color: 'var(--brutalist-cyan, #22d3ee)',
          icon: Info,
          defaultTitle: 'NOTE'
        };
    }
  };

  const config = getStyle();
  const Icon = config.icon;

  return (
    <div
      style={{
        margin: '1.5rem 0',
        padding: '1.25rem 1.5rem',
        border: `2px solid ${config.borderColor}`,
        backgroundColor: 'var(--color-black, #000000)',
        boxShadow: `4px 4px 0px 0px ${config.borderColor}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
        <Icon size={18} color={config.color} />
        <span
          style={{
            fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif',
            fontWeight: 800,
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            color: config.color,
          }}
        >
          [ {title || config.defaultTitle} ]
        </span>
      </div>
      <div style={{ fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', fontSize: '0.875rem', color: 'var(--color-white, #ffffff)', lineHeight: 1.6 }}>
        {children}
      </div>
    </div>
  );
};
