import { useId } from 'react';
import type {
  CSSProperties,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { recipe } from '../lib/recipe';
import { accentVar } from '../lib/theme';
import type { AccentToken } from '../lib/theme';

/**
 * Form controls — the reference for how a component in this system is built.
 *
 * Three things to copy from here:
 *
 *   1. **Every colour addresses a role.** `bg-surface-base`,
 *      `text-content-primary`, `border-edge-strong`, `text-intent-danger`. All
 *      four levels are styled by the same classes and a fifth would be too.
 *   2. **Styling is a `recipe`, not a template string.** The recipe has one
 *      slot per element, so a consumer can reach any of them, and conflicts
 *      resolve — a caller's `bg-surface-raised` genuinely replaces the base's
 *      `bg-surface-base` rather than racing it in CSS source order.
 *   3. **Runtime values stay out of the class string.** The focus accent comes
 *      from a prop, so it travels as a custom property; a utility cannot be
 *      assembled at build time from a value known only at runtime.
 */

const field = recipe({
  slots: {
    root: 'flex w-full flex-col gap-1.5 font-mono',
    label: 'text-xs font-bold uppercase tracking-wider text-content-secondary',
    control:
      'w-full border-2 border-edge-strong bg-surface-base font-mono text-sm text-content-primary transition-colors placeholder:text-content-muted focus:border-[var(--field-accent)] focus:outline-none',
    message: 'font-mono text-xs',
  },
  variants: {
    /** Padding differs by control: a textarea is a box, the others are lines. */
    shape: {
      line: { control: 'px-4 py-2.5' },
      box: { control: 'p-4' },
    },
    invalid: {
      true: {
        control: 'border-intent-danger',
        message: 'font-bold text-intent-danger',
      },
      false: {
        message: 'text-content-muted',
      },
    },
    interactive: {
      true: { control: 'cursor-pointer' },
    },
  },
  defaultVariants: {
    shape: 'line',
    invalid: false,
  },
});

/** Shared by every control here. */
interface FieldProps {
  /**
   * Visible label, wired to the control by a generated id. Omitting it leaves
   * the control unlabelled — pass `aria-label` through if the design genuinely
   * has no visible label.
   */
  label?: string;
  /**
   * Validation message. Its presence turns the border to the danger role and
   * **replaces** `helperText`: an invalid field shows one message, the one that
   * says what to fix.
   */
  error?: string;
  /** Guidance under the control, shown only while there is no `error`. */
  helperText?: string;
  /**
   * Semantic accent for the focus border. Accepts an `Emphasis`
   * (`primary`…`quiet`) or an `Intent` (`info`/`success`/`warning`/`danger`);
   * the legacy hue names still resolve to the same values.
   */
  accent?: AccentToken;
  /**
   * Extra classes on the **control**, not the wrapper. Passed as the recipe's
   * `class` override, so a caller's utility genuinely replaces the base's
   * rather than racing it in CSS source order.
   */
  className?: string;
}

/**
 * Wires label, control, error and helper text together.
 *
 * `useId` rather than a slug of the label text: two fields labelled "Name" on
 * one page produced the same `id`, so clicking one label focused the other.
 * `aria-describedby` and `aria-invalid` make the error something a screen
 * reader announces rather than a visual-only cue.
 */
function useField(id: string | undefined, error?: string, helperText?: string) {
  const generated = useId();
  const fieldId = id ?? generated;
  const messageId = error ? `${fieldId}-error` : helperText ? `${fieldId}-help` : undefined;
  return {
    fieldId,
    messageId,
    controlProps: {
      id: fieldId,
      'aria-invalid': error ? true : undefined,
      'aria-describedby': messageId,
    },
  };
}

/** The accent is known at runtime, so it travels as a custom property. */
function accentStyle(accent: AccentToken): CSSProperties {
  return { '--field-accent': accentVar(accent) } as CSSProperties;
}

function Message({
  id,
  error,
  helperText,
  className,
}: {
  id?: string;
  error?: string;
  helperText?: string;
  className: string;
}) {
  const body = error ?? helperText;
  if (!body) return null;
  return (
    <span id={id} role={error ? 'alert' : undefined} className={className}>
      &gt; {body}
    </span>
  );
}

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>,
    FieldProps {}

/**
 * A labelled single-line text field.
 *
 * One of three controls in this file — `Input`, `TextArea` and `Select` — that
 * share a label, an error and a helper line, so a form built from them lines up
 * without per-field spacing. They are documented on one page because they are
 * one component with three shapes; pick by the kind of value, not by look.
 *
 * Two behaviours worth relying on. The label is wired to the control through a
 * generated `useId`, not a slug of the label text — two fields labelled "Name"
 * on one page used to share an `id`, so clicking one label focused the other.
 * And `error` **replaces** `helperText` rather than stacking under it: an
 * invalid field shows one message, which is the one that tells the reader what
 * to do.
 *
 * `accent` sets the focus border and travels as the `--field-accent` custom
 * property, because a Tailwind class cannot be assembled from a value known
 * only at runtime. That is also why a test here asserts the property rather
 * than the class string — every accent produces the same classes.
 *
 * ```tsx
 * <Input label="Branch" placeholder="main" helperText="Deploys on push." />
 * <Input label="Branch" error="No such branch." accent="danger" />
 * ```
 */
export function Input({
  label,
  error,
  helperText,
  accent = 'primary',
  className = '',
  id,
  ...props
}: InputProps) {
  const { fieldId, messageId, controlProps } = useField(id, error, helperText);
  const styles = field({ invalid: Boolean(error) });

  return (
    <div className={styles.root()}>
      {label && (
        <label htmlFor={fieldId} className={styles.label()}>
          {label}
        </label>
      )}
      <input
        {...controlProps}
        style={accentStyle(accent)}
        // `class` is the recipe's override slot: it merges in rather than being
        // appended after, so a caller's utility actually wins.
        className={styles.control({ class: className })}
        {...props}
      />
      <Message id={messageId} error={error} helperText={helperText} className={styles.message()} />
    </div>
  );
}

export interface TextAreaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>,
    FieldProps {}

/**
 * The multi-line shape of the field contract.
 *
 * Identical to {@link Input} in label, error and helper behaviour — it is the
 * same recipe with box padding instead of line padding — so everything on the
 * `Foundations/Input` page applies here. Documented there rather than on a page
 * of its own for that reason.
 */
export function TextArea({
  label,
  error,
  helperText,
  accent = 'primary',
  className = '',
  id,
  ...props
}: TextAreaProps) {
  const { fieldId, messageId, controlProps } = useField(id, error, helperText);
  const styles = field({ shape: 'box', invalid: Boolean(error) });

  return (
    <div className={styles.root()}>
      {label && (
        <label htmlFor={fieldId} className={styles.label()}>
          {label}
        </label>
      )}
      <textarea
        {...controlProps}
        style={accentStyle(accent)}
        className={styles.control({ class: className })}
        {...props}
      />
      <Message id={messageId} error={error} helperText={helperText} className={styles.message()} />
    </div>
  );
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'>,
    FieldProps {
  /**
   * The choices, in display order. Data rather than children because the
   * native dropdown is the platform's to render.
   */
  options: SelectOption[];
}

/**
 * The choice shape of the field contract.
 *
 * Takes `options` as data rather than `<option>` children, so a caller cannot
 * style the list into something the native control will not render — the
 * dropdown is the platform's, and that is deliberate. Same label, error and
 * helper behaviour as {@link Input}, and documented on the same page.
 */
export function Select({
  label,
  error,
  helperText,
  options,
  accent = 'primary',
  className = '',
  id,
  ...props
}: SelectProps) {
  const { fieldId, messageId, controlProps } = useField(id, error, helperText);
  const styles = field({ invalid: Boolean(error), interactive: true });

  return (
    <div className={styles.root()}>
      {label && (
        <label htmlFor={fieldId} className={styles.label()}>
          {label}
        </label>
      )}
      <select
        {...controlProps}
        style={accentStyle(accent)}
        className={styles.control({ class: className })}
        {...props}
      >
        {options.map((opt) => (
          // Most platforms paint the open dropdown natively rather than from
          // CSS. `color-scheme`, which each level declares, is what actually
          // makes it match — another reason polarity is a declared field.
          <option
            key={opt.value}
            value={opt.value}
            className="bg-surface-raised text-content-primary"
          >
            {opt.label}
          </option>
        ))}
      </select>
      <Message id={messageId} error={error} helperText={helperText} className={styles.message()} />
    </div>
  );
}

export default Input;
