import { useId } from 'react';
import type {
  CSSProperties,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { accentVar } from '../lib/theme';
import type { AccentToken } from '../lib/theme';

/**
 * Form controls, written against semantic roles.
 *
 * This is the reference for migrating the remaining components. Every colour
 * addresses a role — `bg-surface-base`, `text-content-primary`,
 * `border-edge-strong`, `text-intent-danger` — so all four levels are styled by
 * the same classes, and a fifth would be too.
 *
 * What was here before is worth knowing, because the same pattern is still in
 * ~30 other components: `bg-black text-white border-white` only appeared to
 * work, because the old token layer redefined black and white per theme; and
 * `text-zinc-300` on the label was a genuine literal, rendering as
 * near-invisible pale grey on anything light. The accent prop also emitted
 * `focus:border-brutalist-green`, a class that has never existed — the token is
 * `neonGreen` — so that option silently did nothing.
 */

/** Shared by every control here. */
interface FieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  /**
   * Semantic accent for the focus border. Accepts an `Emphasis`
   * (`primary`…`quiet`) or an `Intent` (`info`/`success`/`warning`/`danger`);
   * the legacy hue names still resolve to the same values.
   */
  accent?: AccentToken;
  className?: string;
}

const FIELD_BASE =
  'w-full bg-surface-base text-content-primary border-2 border-edge-strong text-sm font-mono placeholder:text-content-muted focus:outline-none transition-colors focus:border-[var(--field-accent)]';

const LABEL = 'text-xs font-bold uppercase tracking-wider text-content-secondary';

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

/** The accent is a runtime value, so it travels as a custom property — a
 * Tailwind class cannot be assembled from a prop at build time. */
function accentStyle(accent: AccentToken): CSSProperties {
  return { '--field-accent': accentVar(accent) } as CSSProperties;
}

function Message({ id, error, helperText }: { id?: string; error?: string; helperText?: string }) {
  if (error) {
    return (
      <span id={id} role="alert" className="text-xs font-mono font-bold text-intent-danger">
        &gt; {error}
      </span>
    );
  }
  if (helperText) {
    return (
      <span id={id} className="text-xs font-mono text-content-muted">
        &gt; {helperText}
      </span>
    );
  }
  return null;
}

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>,
    FieldProps {}

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

  return (
    <div className="flex flex-col gap-1.5 w-full font-mono">
      {label && (
        <label htmlFor={fieldId} className={LABEL}>
          {label}
        </label>
      )}
      <input
        {...controlProps}
        style={accentStyle(accent)}
        className={`${FIELD_BASE} px-4 py-2.5 ${error ? 'border-intent-danger' : ''} ${className}`.trim()}
        {...props}
      />
      <Message id={messageId} error={error} helperText={helperText} />
    </div>
  );
}

export interface TextAreaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>,
    FieldProps {}

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

  return (
    <div className="flex flex-col gap-1.5 w-full font-mono">
      {label && (
        <label htmlFor={fieldId} className={LABEL}>
          {label}
        </label>
      )}
      <textarea
        {...controlProps}
        style={accentStyle(accent)}
        className={`${FIELD_BASE} p-4 ${error ? 'border-intent-danger' : ''} ${className}`.trim()}
        {...props}
      />
      <Message id={messageId} error={error} helperText={helperText} />
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
  options: SelectOption[];
}

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

  return (
    <div className="flex flex-col gap-1.5 w-full font-mono">
      {label && (
        <label htmlFor={fieldId} className={LABEL}>
          {label}
        </label>
      )}
      <select
        {...controlProps}
        style={accentStyle(accent)}
        className={`${FIELD_BASE} px-4 py-2.5 cursor-pointer ${
          error ? 'border-intent-danger' : ''
        } ${className}`.trim()}
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
      <Message id={messageId} error={error} helperText={helperText} />
    </div>
  );
}

export default Input;
