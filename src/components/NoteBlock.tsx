import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { semanticTokens } from '../lib/theme';

export interface NoteBlockProps {
  /**
   * Which callout this is. Each type fixes an intent colour, an icon and a
   * default heading together — `note`/info, `tip`/success, `important`/warning,
   * `warning`/danger. Note that `important` and `warning` are *not* in the
   * order the names suggest: `warning` is the strongest of the four and uses
   * the danger role.
   */
  type?: 'note' | 'tip' | 'warning' | 'important';
  /**
   * Overrides the type's default heading (`NOTE`, `PRO TIP`, `IMPORTANT`,
   * `WARNING`). The icon and the colour do not change with it, so use it to say
   * *what* rather than to re-badge the severity.
   */
  title?: string;
  /** The callout body. Prose, a short list — whatever the aside contains. */
  children: React.ReactNode;
}

/**
 * The callout aside: icon, heading, coloured border and offset shadow.
 *
 * `type` is the only real decision, and it is an intent choice rather than a
 * colour one. The four are ordered by how much they interrupt: `note` is
 * context the reader may skip, `tip` is optional advantage, `important` is
 * something they must know, `warning` is something that will cost them if
 * ignored. Reaching for `warning` because red looks emphatic is how a page ends
 * up with four warnings and no warning.
 *
 * `TLDR` is the neighbouring component and answers a different question: it
 * summarises the article, appears once, and is not configurable. This one is an
 * aside within the flow and can appear as often as the content needs.
 *
 * ```tsx
 * <NoteBlock type="warning" title="Read before applying">
 *   Import the existing resources first; a plan that proposes deleting a live
 *   domain is a registry bug, not an intended change.
 * </NoteBlock>
 * ```
 */
export const NoteBlock: React.FC<NoteBlockProps> = ({
  type = 'note',
  title,
  children
}) => {
  const getStyle = () => {
    switch (type) {
      case 'tip':
        return {
          borderColor: semanticTokens.intent.success,
          color: semanticTokens.intent.success,
          icon: CheckCircle2,
          defaultTitle: 'PRO TIP'
        };
      case 'warning':
        return {
          borderColor: semanticTokens.intent.danger,
          color: semanticTokens.intent.danger,
          icon: AlertTriangle,
          defaultTitle: 'WARNING'
        };
      case 'important':
        return {
          borderColor: semanticTokens.intent.warning,
          color: semanticTokens.intent.warning,
          icon: AlertCircle,
          defaultTitle: 'IMPORTANT'
        };
      default:
        return {
          borderColor: semanticTokens.intent.info,
          color: semanticTokens.intent.info,
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
        backgroundColor: semanticTokens.surface.base,
        boxShadow: `4px 4px 0px 0px ${config.borderColor}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
        <Icon size={18} color={config.color} />
        <span
          style={{
            fontFamily: semanticTokens.font.display,
            fontWeight: 800,
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            color: config.color,
          }}
        >
          [ {title || config.defaultTitle} ]
        </span>
      </div>
      <div style={{ fontFamily: semanticTokens.font.mono, fontSize: '0.875rem', color: semanticTokens.text.primary, lineHeight: 1.6 }}>
        {children}
      </div>
    </div>
  );
};
