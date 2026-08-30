import type { ReactNode, MouseEventHandler } from 'react';
import type { AccentToken } from '../lib/theme';

/** @deprecated Use {@link AccentToken}. Retained for existing call sites. */
export type TagAccent = 'yellow' | 'cyan' | 'pink' | 'green';

export interface TagProps {
  /** Tag text string or custom element. */
  text: string;
  /** Optional custom URL href. If provided, renders as an `<a>` anchor tag. */
  href?: string;
  /** Background accent color. Defaults to yellow. */
  accent?: AccentToken;
  /** Click event handler. */
  onClick?: MouseEventHandler<HTMLElement>;
  /** Optional custom CSS classes. */
  className?: string;
  /** Prefix character, defaults to '#'. */
  prefix?: string;
  /**
   * Ignored. `Tag` renders `text` with the prefix applied, and the destructure
   * in the implementation never reads this — it survives so existing call sites
   * that pass children still compile. Use `text`.
   *
   * @deprecated Pass the label as `text`.
   */
  children?: ReactNode;
}


const ACCENT_CLASSES: Record<string, string> = {
  primary: 'bg-accent-primary text-content-inverse hover:bg-accent-secondary',
  secondary: 'bg-accent-secondary text-content-inverse hover:bg-accent-tertiary',
  tertiary: 'bg-accent-tertiary text-content-inverse hover:bg-accent-primary',
  quiet: 'bg-accent-quiet text-content-inverse hover:bg-accent-primary',
  info: 'bg-intent-info text-content-inverse hover:bg-accent-secondary',
  success: 'bg-intent-success text-content-inverse hover:bg-accent-secondary',
  warning: 'bg-intent-warning text-content-inverse hover:bg-accent-tertiary',
  danger: 'bg-intent-danger text-content-inverse hover:bg-accent-primary',
  yellow: 'bg-accent-secondary text-content-inverse hover:bg-accent-tertiary',
  cyan: 'bg-accent-primary text-content-inverse hover:bg-accent-secondary',
  pink: 'bg-accent-tertiary text-content-inverse hover:bg-accent-primary',
  green: 'bg-intent-success text-content-inverse hover:bg-accent-secondary',
};

/**
 * A filled keyword pill — a topic, a category, a facet.
 *
 * The distinction from `Badge` is worth getting right, because they look
 * similar and mean opposite things. A `Badge` reports *state* and is filled
 * only by its border: `HEALTHY`, `v1.1.0`, `FAILED`. A `Tag` is *taxonomy*, is
 * filled solid, and is prefixed `#` — it says the thing belongs to a set, and
 * is usually a link to the rest of that set. Status is never a `Tag`, because
 * `#failed` invites a reader to click through to everything else that failed.
 *
 * `text` is slugged into the label: spaces become hyphens and the prefix is
 * added unless the text already starts with it, so `"design systems"` renders
 * `#design-systems`. Pass `href` and it becomes an `<a>`; pass `onClick`
 * without one and it stays a `<button>`.
 *
 * ```tsx
 * <Tag text="design systems" href="/tags/design-systems" />
 * <Tag text="typescript" accent="info" prefix="~" />
 * ```
 */
export function Tag({
  text,
  href,
  accent = 'secondary',
  onClick,
  className = '',
  prefix = '#',
}: TagProps) {
  const baseClasses =
    'inline-block font-mono text-xs font-bold uppercase border-2 border-edge-strong px-2 py-1 hover:shadow-hard-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent-primary';
  const accentClass = ACCENT_CLASSES[accent] ?? ACCENT_CLASSES.secondary;
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
