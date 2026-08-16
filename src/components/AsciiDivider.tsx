import React from 'react';

export interface AsciiDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  pattern?: string;
}

/**
 * A rule drawn in characters rather than pixels.
 *
 * The styling used to be an `.ascii-divider` class in `styles.css`; it is
 * utilities here now, per the styling-lives-in-TSX rule.
 *
 * The class name stays on the element as a **hook** carrying no styles of its
 * own — the blog attaches `.ascii-divider::after` from its own stylesheet to
 * draw a pencil rule on the light levels, and a pseudo-element is the one thing
 * a component genuinely cannot express. Consumers must render this component
 * rather than putting the bare class on a div, though: the class alone no
 * longer paints anything.
 */
export const AsciiDivider: React.FC<AsciiDividerProps> = ({
  pattern = '//====================================================//',
  className = '',
  ...props
}) => {
  return (
    <div
      className={`ascii-divider font-mono text-accent-primary tracking-[0.2em] select-none my-6 ${className}`.trim()}
      {...props}
    >
      {pattern}
    </div>
  );
};
