import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  ReactNode,
} from 'react';
import { recipe } from '../lib/recipe';

/**
 * The roles a button can be filled with.
 *
 * `primary`/`secondary`/`tertiary` are the emphasis ladder; `inverse` is the
 * maximum-contrast button, which paints `--ds-text-primary` as its ground.
 */
export type ButtonEmphasis = 'primary' | 'secondary' | 'tertiary' | 'inverse';

/**
 * The pre-0.4 hue names, each an alias of the role it always resolved to.
 *
 * Kept so existing call sites compile and render identically. They are not a
 * second way of choosing — `cyan` and `primary` are the same value — and new
 * code should use {@link ButtonEmphasis}.
 *
 * @deprecated Names a hue rather than the role it resolves to. `cyan`/`default`
 * → `primary`, `yellow` → `secondary`, `pink` → `tertiary`, `white` →
 * `inverse`.
 */
export type LegacyButtonVariant = 'cyan' | 'pink' | 'yellow' | 'white' | 'default';

export type ButtonVariant = ButtonEmphasis | LegacyButtonVariant;

interface ButtonOwnProps {
  /**
   * The label. Uppercased by the base style, so write it in normal case; an
   * icon node beside the text lays out correctly without extra wrapping.
   */
  children: ReactNode;
  /**
   * Which accent role fills the button.
   *
   * `inverse` is the maximum-contrast option: it paints the text colour as the
   * ground, so it is a white button with near-black text on `midnight` and
   * inverts to dark-on-paper at the light end.
   *
   * The hue names (`cyan`, `pink`, `yellow`, `white`, `default`) still resolve
   * to exactly these roles and are kept so existing call sites compile. They
   * are deprecated: they name the colour the role happens to be on `midnight`,
   * which is not a colour the button guarantees — `cyan` is `#22d3ee` there and
   * `#1d4ed8` on `white`.
   */
  variant?: ButtonVariant;
  /**
   * Padding and type scale: `sm` for a toolbar or table row, `md` for the
   * body of a page, `lg` for a landing-page CTA. The 2px border and the offset
   * shadow do not scale with it, which is what keeps the three recognisable as
   * one control.
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Wrap the label in `[ BRACKETS ]`. Off by default — unlike `PageTitle`,
   * where it is on — because a page carries many buttons and few titles, and
   * bracketing all of them spends the device on nothing. Reserve it for the
   * primary action.
   */
  bracketed?: boolean;
  /**
   * Extra classes. Merged rather than appended, so a caller's `bg-*` genuinely
   * replaces the variant's instead of racing it in CSS source order.
   */
  className?: string;
}

/**
 * The `<button>` form. `href?: never` is what makes the union below
 * discriminate: without it TypeScript would accept `href` here and silently
 * drop it onto an element that ignores it.
 */
export type ButtonElementProps = ButtonOwnProps &
  DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
    /** Absent on the button form. Passing it selects the anchor form instead. */
    href?: never;
  };

/** The `<a>` form. Passing `href` selects it; there is no `as` prop to remember. */
export type ButtonLinkProps = ButtonOwnProps &
  DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> & {
    /**
     * Destination. Its presence is what selects the anchor form — there is no
     * `as` prop — after which TypeScript offers `target`, `rel` and `download`
     * and withdraws `disabled` and `type`.
     */
    href: string;
  };

export type ButtonProps = ButtonElementProps | ButtonLinkProps;

/**
 * The press affordance — offset shadow that collapses as the control moves into
 * it. Shared rather than repeated so the four accents cannot drift apart.
 */
const PRESS =
  'shadow-hard-md hover:shadow-hard-lg active:translate-x-1 active:translate-y-1 active:shadow-none';

/**
 * One class string per role. The hue names below alias these rather than
 * repeating them, so an alias cannot drift from the role it claims to be.
 */
const PRIMARY = `bg-accent-primary text-content-inverse border-edge-strong ${PRESS}`;
const SECONDARY = `bg-accent-secondary text-content-inverse border-edge-strong ${PRESS}`;
const TERTIARY = `bg-accent-tertiary text-content-inverse border-edge-strong ${PRESS}`;
const INVERSE = `bg-content-primary text-content-inverse border-content-primary ${PRESS}`;

const button = recipe({
  base: 'font-mono font-bold uppercase border-2 transition-all duration-200',
  variants: {
    size: {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    },
    variant: {
      primary: PRIMARY,
      secondary: SECONDARY,
      tertiary: TERTIARY,
      inverse: INVERSE,

      // Deprecated aliases. Sharing the constant is what makes "renders
      // identically" a property of the code rather than a claim in a comment.
      cyan: PRIMARY,
      default: PRIMARY,
      yellow: SECONDARY,
      pink: TERTIARY,
      white: INVERSE,
    },
    /**
     * An anchor is not `inline-flex` by default and carries an underline, so the
     * two forms would otherwise lay out and read differently from identical
     * props. A variant rather than a prepended string so a caller's own
     * `className` still resolves against it.
     */
    asLink: {
      true: 'inline-flex items-center justify-center no-underline',
    },
  },
  defaultVariants: {
    // `tertiary`, spelled as the role. It is the same value `'pink'` resolved
    // to, so the default button is unchanged.
    variant: 'tertiary',
    size: 'md',
  },
});

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
 * <Button href="/pricing" variant="tertiary" bracketed size="lg">SEE PRICING</Button>
 * ```
 */
export function Button(props: ButtonProps) {
  const {
    children,
    variant = 'tertiary',
    size = 'md',
    bracketed = false,
    className,
    ...rest
  } = props;

  const content = bracketed ? (
    <span className="inline-flex items-center justify-center gap-2">
      <span className="select-none" aria-hidden="true">
        [
      </span>
      <span className="inline-flex items-center gap-2">{children}</span>
      <span className="select-none" aria-hidden="true">
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
        className={button({ variant, size, asLink: true, class: className })}
      >
        {content}
      </a>
    );
  }

  const buttonProps = rest as Omit<ButtonElementProps, keyof ButtonOwnProps>;
  return (
    <button {...buttonProps} className={button({ variant, size, class: className })}>
      {content}
    </button>
  );
}
