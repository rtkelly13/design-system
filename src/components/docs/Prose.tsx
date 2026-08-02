import type { HTMLAttributes, ReactNode } from 'react';

export interface ProseProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * Typography scope for compiled Markdown/MDX output.
 *
 * Everything a Markdown pipeline emits — `ul`, `ol`, `table`, `blockquote`,
 * `hr`, inline `code`, `a` — arrives as bare HTML tags with no class names, so
 * it cannot be styled by utility classes. `prose.css` styles those tags, but
 * only inside `.docs-prose`, keeping the resets off the rest of the app.
 *
 * Wrap only the rendered document body; chrome (sidebar, TOC, pager) should sit
 * outside it.
 */
export function Prose({ children, className = '', ...rest }: ProseProps) {
  return (
    <div className={`docs-prose ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}

export default Prose;
