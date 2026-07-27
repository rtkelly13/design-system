import type { ReactNode, ElementType } from 'react';

export type StatCardAccent = 'cyan' | 'pink' | 'yellow' | 'green';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  icon?: ElementType<{ className?: string }>;
  accent?: StatCardAccent;
  className?: string;
}

const ACCENT_BORDER_HOVER: Record<StatCardAccent, string> = {
  cyan: 'hover:border-brutalist-cyan hover:shadow-hard-cyan',
  pink: 'hover:border-brutalist-pink hover:shadow-hard-pink',
  yellow: 'hover:border-brutalist-yellow hover:shadow-hard-yellow',
  green: 'hover:border-brutalist-neonGreen hover:shadow-hard-sm',
};

const ACCENT_TEXT: Record<StatCardAccent, string> = {
  cyan: 'text-brutalist-cyan',
  pink: 'text-brutalist-pink',
  yellow: 'text-brutalist-yellow',
  green: 'text-brutalist-neonGreen',
};

export function StatCard({
  title,
  value,
  change,
  changeType = 'positive',
  subtitle,
  icon: Icon,
  accent = 'cyan',
  className = '',
}: StatCardProps) {
  const hoverClass = ACCENT_BORDER_HOVER[accent];
  const accentText = ACCENT_TEXT[accent];

  const changeColorClass =
    changeType === 'positive'
      ? 'text-brutalist-neonGreen'
      : changeType === 'negative'
        ? 'text-red-400'
        : 'text-zinc-400';

  return (
    <div
      className={`bg-zinc-900 border-2 border-white p-6 transition-all duration-200 ${hoverClass} ${className}`.trim()}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400">
          [ {title} ]
        </span>
        {Icon && <Icon className={`h-6 w-6 ${accentText}`} />}
      </div>
      <div className="flex items-baseline gap-3 my-1">
        <span className="font-display text-4xl font-extrabold text-white tracking-tight">
          {value}
        </span>
        {change && (
          <span className={`font-mono text-xs font-bold ${changeColorClass}`}>
            {change}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="font-mono text-xs text-zinc-400 mt-2">
          &gt; {subtitle}
        </p>
      )}
    </div>
  );
}

export default StatCard;
