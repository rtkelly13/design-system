import type { ReactNode, MouseEventHandler } from 'react';

export type TagAccent = 'yellow' | 'cyan' | 'pink' | 'green';

export interface TagProps {
  /** Tag text string or custom element. */
  text: string;
  /** Optional custom URL href. If provided, renders as an `<a>` anchor tag. */
  href?: string;
  /** Background accent color. Defaults to yellow. */
  accent?: TagAccent;
  /** Click event handler. */
  onClick?: MouseEventHandler<HTMLElement>;
  /** Optional custom CSS classes. */
  className?: string;
  /** Prefix character, defaults to '#'. */
  prefix?: string;
  children?: ReactNode;
}

const ACCENT_CLASSES: Record<TagAccent, string> = {
  yellow: 'bg-brutalist-yellow text-black hover:bg-brutalist-pink',
  cyan: 'bg-brutalist-cyan text-black hover:bg-brutalist-yellow',
  pink: 'bg-brutalist-pink text-black hover:bg-brutalist-cyan',
  green: 'bg-brutalist-green text-black hover:bg-brutalist-yellow',
};

export function Tag({
  text,
  href,
  accent = 'yellow',
  onClick,
  className = '',
  prefix = '#',
}: TagProps) {
  const baseClasses =
    'inline-block font-mono text-xs font-bold uppercase border-2 border-white px-2 py-1 hover:shadow-hard-sm transition-all focus:outline-none focus:ring-2 focus:ring-brutalist-cyan';
  const accentClass = ACCENT_CLASSES[accent] || ACCENT_CLASSES.yellow;
  const combinedClasses = `${baseClasses} ${accentClass} ${className}`.trim();
  const label = text.startsWith(prefix) ? text : `${prefix}${text.split(' ').join('-')}`;

  if (href) {
    return (
      <a href={href} className={combinedClasses} onClick={onClick}>
        {label}
      </a>
    );
  }

  return (
    <span className={combinedClasses} onClick={onClick}>
      {label}
    </span>
  );
}

export default Tag;
