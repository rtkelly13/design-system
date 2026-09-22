import { forwardRef } from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { Field as BaseField } from '@base-ui/react/field';
import { recipe } from '../lib/recipe';
import { accentVar } from '../lib/theme';
import type { AccentToken } from '../lib/theme';

/**
 * The one field implementation.
 *
 * It was inside `Input.tsx`, which was fine while the only fields were the
 * three text controls. It is a module of its own now because `Checkbox` and
 * `Switch` need exactly the same semantics in a different arrangement, and the
 * alternative — a second `Field.Root` composed by hand next door — is the
 * "second field implementation" #238 exists to prevent. One implementation is
 * also what makes a boolean and a text input agree about what `error` means.
 *
 * Nothing exports this from `src/index.ts`, deliberately, for the reason
 * `dialogSurface.ts` states: it holds a `recipe`, whose type comes from
 * `tailwind-variants`, and publishing it would put that library back into the
 * `.d.ts`.
 */

const frame = recipe({
  slots: {
    root: 'flex w-full flex-col gap-1.5 font-mono',
    label: 'text-xs font-bold uppercase tracking-wider text-content-secondary',
    message: 'font-mono text-xs',
  },
  variants: {
    invalid: {
      true: {
        message: 'font-bold text-intent-danger',
      },
      false: {
        message: 'text-content-muted',
      },
    },
    /**
     * Where the label sits, which is the whole difference between a text field
     * and a boolean one.
     *
     * `stack` writes the label above the control. `inline` puts the control
     * *inside* the label, which is Base UI's documented pattern for a checkbox
     * or a switch: the label then owns the hit area, and `htmlFor` still points
     * at the hidden input, so a click on the words toggles the control without
     * anyone wiring an `onClick`.
     */
    layout: {
      stack: {},
      inline: {
        label:
          'flex w-fit cursor-pointer items-center gap-3 text-sm text-content-primary '
          + 'data-[disabled]:cursor-not-allowed data-[disabled]:text-content-muted',
      },
    },
  },
  defaultVariants: {
    invalid: false,
    layout: 'stack',
  },
});

/** Shared by every control built on this frame. */
export interface FieldProps {
  /**
   * The visible label, wired to the control by `id` — generated when none is
   * supplied, so the association holds without the caller arranging it. Omit
   * it only where a visible label exists elsewhere, and then give the control
   * an `aria-label`: a field with no name is a field a screen reader cannot
   * announce.
   */
  label?: string;
  /**
   * The validation message. Its presence is also the invalid state: it sets
   * `aria-invalid`, switches the border to `intent.danger`, and is announced.
   * Pass the message, never a boolean — "invalid" without a reason leaves the
   * reader to guess what to change.
   */
  error?: string;
  /**
   * Standing guidance shown under the control — a format, a constraint, what
   * the value is for. Always visible, unlike `error`, and replaced by it while
   * one is set, because two competing instructions under one field is worse
   * than either.
   */
  helperText?: string;
  /**
   * Semantic accent for the focus border. Accepts an `Emphasis`
   * (`primary`…`quiet`) or an `Intent` (`info`/`success`/`warning`/`danger`);
   * the legacy hue names still resolve to the same values.
   */
  accent?: AccentToken;
  /**
   * Merged onto the control itself, not the wrapper — so it sizes the input
   * (`w-full`) rather than the label-and-error group around it.
   */
  className?: string;
}

/**
 * The props a boolean control adds to the shared field contract.
 *
 * Declared once and implemented by both `Checkbox` and `Switch`, because #238
 * is one capability in two presentations: a pair that disagreed about
 * `readOnly` or `onCheckedChange` would be the same defect as having no
 * control at all.
 *
 * `onCheckedChange` takes the new value and nothing else. Base UI passes event
 * details as a second argument; forwarding that would name a Base UI type in
 * the published `.d.ts`, which the confinement rule forbids.
 */
export interface BooleanFieldProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'className' | 'defaultChecked' | 'onChange'>,
    FieldProps {
  /** Ticked or on. Supplying it makes the control controlled; pair it with `onCheckedChange`. */
  checked?: boolean;
  /** The starting value for an uncontrolled control. Ignored when `checked` is set. */
  defaultChecked?: boolean;
  /** Called with the new value whenever the user toggles the control. */
  onCheckedChange?: (checked: boolean) => void;
  /**
   * The name the value is submitted under. Base UI renders the hidden input
   * that carries it, so a control inside a `<form>` appears in `FormData`
   * without anything here rendering an input of its own.
   */
  name?: string;
  /** The value submitted when checked. Defaults to the native `"on"`. */
  value?: string;
  /** Ignores user interaction, and greys the label with it. */
  disabled?: boolean;
  /** Announces and renders the current value, but refuses to change it. */
  readOnly?: boolean;
  /** Marks the control as required for form submission. */
  required?: boolean;
  /** Placed on the control, never on the wrapper — see `FieldFrame`. */
  id?: string;
}

/** The accent is known at runtime, so it travels as a custom property. */
export function accentStyle(accent: AccentToken): CSSProperties {
  return { '--field-accent': accentVar(accent) } as CSSProperties;
}

export interface FieldFrameProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children'> {
  label?: string;
  error?: string;
  helperText?: string;
  /** Passed to `Field.Root`, so the label and message grey out with the control. */
  disabled?: boolean;
  /** `stack` for a text control, `inline` for a boolean one. */
  layout?: 'stack' | 'inline';
  /** Merged onto the wrapper. The control's own `className` is its business. */
  className?: string;
  /** Merged onto the label, for the row a boolean control lays out. */
  labelClassName?: string;
  children: ReactNode;
}

/**
 * The label, message and ARIA wiring every control shares.
 *
 * This was a hand-rolled `useField()` returning `id`, `aria-invalid` and
 * `aria-describedby`. Base UI's `Field` is the public equivalent, and it owns
 * two things the hook did not: `aria-describedby` composes when a field carries
 * *both* a description and an error, and the validity state is exposed to
 * descendants — `CheckboxRootState extends FieldRootState`, so `Checkbox` and
 * `Switch` inherit `disabled`, `touched`, `dirty`, `valid`, `filled` and
 * `focused` rather than re-deriving them.
 *
 * `error` here is a prop rather than native constraint validation, so
 * `Field.Root` is told it is `invalid` and `Field.Error` is matched
 * unconditionally. That keeps the control externally driven, which is what the
 * existing API promises.
 *
 * Both parts render a `span` rather than Base UI's default `p`, because a
 * message sits inside a flex column beside the control and a block paragraph
 * would change the layout.
 *
 * A caller's `id` goes on the *control*, never on `Field.Root` — the root's
 * `id` names the wrapper, and passing it there silently leaves the control on
 * a generated id while the label still points at it. The symptom is an `id`
 * prop that appears to do nothing.
 */
export const FieldFrame = forwardRef<HTMLDivElement, FieldFrameProps>(function FieldFrame(
  { label, error, helperText, disabled, layout = 'stack', className, labelClassName, children, ...props },
  ref,
) {
  const styles = frame({ invalid: Boolean(error), layout });

  return (
    <BaseField.Root
      ref={ref}
      data-slot="field"
      className={styles.root({ class: className })}
      invalid={Boolean(error)}
      disabled={disabled}
      {...props}
    >
      {layout === 'inline' ? (
        // The control goes *inside* the label. A boolean control is a span with
        // `role="checkbox"`, not a labelable element, so a sibling label would
        // associate by `aria-labelledby` alone and the words would not be a hit
        // target. Base UI's own Field examples nest it for the same reason.
        label ? (
          <BaseField.Label data-slot="field-label" className={styles.label({ class: labelClassName })}>
            {children}
            {label}
          </BaseField.Label>
        ) : (
          children
        )
      ) : (
        <>
          {label && (
            <BaseField.Label data-slot="field-label" className={styles.label({ class: labelClassName })}>
              {label}
            </BaseField.Label>
          )}
          {children}
        </>
      )}
      {error ? (
        <BaseField.Error
          match
          data-slot="field-error"
          className={styles.message()}
          render={<span role="alert" />}
        >
          &gt; {error}
        </BaseField.Error>
      ) : helperText ? (
        <BaseField.Description data-slot="field-description" className={styles.message()} render={<span />}>
          &gt; {helperText}
        </BaseField.Description>
      ) : null}
    </BaseField.Root>
  );
});
