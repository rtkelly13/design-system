import type { ElementType } from 'react';
import { accentHoverEdgeClass, accentTextClass } from '../lib/accentClasses';
import { cn } from '../lib/recipe';
import type { AccentToken } from '../lib/theme';

/**
 * Accepted accents. Widened from the four palette names to the full role set;
 * the old names still resolve to the same roles, so existing call sites keep
 * rendering identically.
 */
export type StatCardAccent = AccentToken;

export interface StatCardProps {
  /** What is being measured, in small mono caps above the figure. */
  title: string;
  /**
   * The figure itself, at display size. Pre-format it — `'1.2M'`, `'99.98%'`,
   * `'41ms'` — because this renders what it is given and a raw float will run
   * past the card.
   */
  value: string | number;
  /** The delta beside the figure, e.g. `'+12%'` or `'-3 since Friday'`. */
  change?: string;
  /**
   * How to read `change`. Deliberately *not* inferred from a leading `-`: for
   * latency or error rate a fall is good, and a component that guesses gets
   * that backwards. It colours from the intent roles rather than the card's
   * `accent`, so a card accented `danger` still shows a rise in green.
   */
  changeType?: 'positive' | 'negative' | 'neutral';
  /** A line of context under the figure — the window it covers, or its source. */
  subtitle?: string;
  /** Leading glyph, a lucide icon or any component taking `className`. */
  icon?: ElementType<{ className?: string }>;
  /**
   * Colours the icon, the hover border and the figure. This is hierarchy —
   * which card the eye lands on first in a row — not status. Status is
   * `changeType`.
   */
  accent?: StatCardAccent;
  /** Extra classes on the card. */
  className?: string;
}


/**
 * A change is meaning, not decoration, so it reads from the intent roles rather
 * than the card's accent — a card accented `danger` still shows a rise in the
 * success colour.
 */
const CHANGE_CLASS: Record<NonNullable<StatCardProps['changeType']>, string> = {
  positive: 'text-intent-success',
  negative: 'text-intent-danger',
  neutral: 'text-content-muted',
};

/**
 * A single headline figure with its delta and context.
 *
 * The one thing to get right is that this component carries **two independent
 * colour channels**, and conflating them is the usual mistake. `accent` is
 * hierarchy: it says which card in a row of four should be looked at first.
 * `changeType` is meaning: it says whether the movement is good news. A card
 * can be accented `danger` for prominence and still show a rise in the success
 * colour, because those are answers to different questions.
 *
 * `changeType` is explicit for the same reason. A `-40%` in error rate is
 * `positive`; a `-40%` in signups is `negative`. Nothing about the string says
 * which, so nothing infers it.
 *
 * ```tsx
 * <StatCard title="Compute latency" value="41ms" change="-18%" changeType="positive"
 *           subtitle="p95, last 24h" accent="primary" icon={Gauge} />
 * ```
 */
export function StatCard({
  title,
  value,
  change,
  changeType = 'positive',
  subtitle,
  icon: Icon,
  accent = 'primary',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-surface-raised border-2 border-edge-strong p-6 transition-all duration-200',
        accentHoverEdgeClass(accent),
        className,
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-content-muted">
          [ {title} ]
        </span>
        {Icon && <Icon className={`h-6 w-6 ${accentTextClass(accent)}`} />}
      </div>
      <div className="flex items-baseline gap-3 my-1">
        <span className="font-display text-4xl font-extrabold text-content-primary tracking-tight">
          {value}
        </span>
        {change && (
          <span className={`font-mono text-xs font-bold ${CHANGE_CLASS[changeType]}`}>
            {change}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="font-mono text-xs text-content-muted mt-2">
          &gt; {subtitle}
        </p>
      )}
    </div>
  );
}

export default StatCard;
