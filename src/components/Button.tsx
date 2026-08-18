import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  ReactNode,
} from 'react';

interface ButtonOwnProps {
  children: ReactNode;
  variant?: 'cyan' | 'pink' | 'yellow' | 'white' | 'default';
  size?: 'sm' | 'md' | 'lg';
  bracketed?: boolean;
  className?: string;
}

/**
 * The `<button>` form. `href?: never` is what makes the union below
 * discriminate: without it TypeScript would accept `href` here and silently
 * drop it onto an element that ignores it.
 */
export type ButtonElementProps = ButtonOwnProps &
  DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
    href?: never;
  };

/** The `<a>` form. Passing `href` selects it; there is no `as` prop to remember. */
export type ButtonLinkProps = ButtonOwnProps &
  DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> & {
    href: string;
  };

export type ButtonProps = ButtonElementProps | ButtonLinkProps;

const BASE = 'font-mono font-bold uppercase border-2 transition-all duration-200';

const SIZES = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
} as const;

const PRESS =
  'shadow-hard-md hover:shadow-hard-lg active:translate-x-1 active:translate-y-1 active:shadow-none';

const VARIANTS = {
  cyan: `bg-brutalist-cyan text-black border-white ${PRESS}`,
  pink: `bg-brutalist-pink text-black border-white ${PRESS}`,
  yellow: `bg-brutalist-yellow text-black border-white ${PRESS}`,
  white: `bg-white text-black border-black ${PRESS}`,
  default: `bg-brutalist-cyan text-black border-white ${PRESS}`,
} as const;

/**
 * A button, or a link that looks like one.
 *
 * The distinction is not cosmetic and is not the caller's styling preference:
 * a control that *navigates* must be an `<a>`, or it loses middle-click,
 * open-in-new-tab, the status-bar URL preview, and its announcement as a link
 * to a screen reader. Marketing CTAs are overwhelmingly navigation — "Get
 * started" goes somewhere — so a button-only component pushes every landing
 * page into either nesting an anchor inside a button (invalid HTML) or
 * re-styling the whole thing by hand.
 *
 * Passing `href` selects the anchor form, and TypeScript then offers anchor
 * attributes (`target`, `rel`, `download`) and withdraws button-only ones
 * (`disabled`, `type`) — the latter being the point, since `disabled` does
 * nothing whatsoever on an anchor.
 *
 * ```tsx
 * <Button onClick={save}>SAVE</Button>
 * <Button href="/pricing" variant="pink" bracketed size="lg">SEE PRICING</Button>
 * ```
 */
export function Button(props: ButtonProps) {
  const {
    children,
    variant = 'pink',
    size = 'md',
    bracketed = false,
    className = '',
    ...rest
  } = props;

  const variantKey = variant === 'default' ? 'cyan' : variant;
  const classes = `${BASE} ${SIZES[size]} ${VARIANTS[variantKey]} ${className}`.trim();

  const content = bracketed ? (
    <span className="inline-flex items-center justify-center gap-2">
      <span className="bracket-glyph select-none" aria-hidden="true">
        [
      </span>
      <span className="inline-flex items-center gap-2">{children}</span>
      <span className="bracket-glyph select-none" aria-hidden="true">
        ]
      </span>
    </span>
  ) : (
    <span className="inline-flex items-center justify-center gap-2">{children}</span>
  );

  if (typeof props.href === 'string') {
    const anchorProps = rest as Omit<ButtonLinkProps, keyof ButtonOwnProps>;
    return (
      <a
        {...anchorProps}
        // A `target="_blank"` document can reach back through `window.opener`
        // unless told otherwise. Modern browsers imply `noopener`, but not
        // every renderer this package ships into is a modern browser, and an
        // explicit `rel` costs nothing. An explicit `rel` from the caller wins.
        rel={
          anchorProps.rel ??
          (anchorProps.target === '_blank' ? 'noopener noreferrer' : undefined)
        }
        // `inline-flex` rather than the anchor default, so padding and the
        // bracket glyphs lay out identically to the button form.
        className={`inline-flex items-center justify-center no-underline ${classes}`}
      >
        {content}
      </a>
    );
  }

  const buttonProps = rest as Omit<ButtonElementProps, keyof ButtonOwnProps>;
  return (
    <button {...buttonProps} className={classes}>
      {content}
    </button>
  );
}

export default Button;
