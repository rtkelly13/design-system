import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  accent?: 'cyan' | 'pink' | 'yellow' | 'green';
  className?: string;
}

export function Input({
  label,
  error,
  helperText,
  accent = 'cyan',
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const borderFocusClasses = {
    cyan: 'focus:border-brutalist-cyan focus:ring-brutalist-cyan',
    pink: 'focus:border-brutalist-pink focus:ring-brutalist-pink',
    yellow: 'focus:border-brutalist-yellow focus:ring-brutalist-yellow',
    green: 'focus:border-brutalist-green focus:ring-brutalist-green',
  };

  return (
    <div className="flex flex-col gap-1.5 w-full font-mono">
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full bg-black text-white border-2 border-white px-4 py-2.5 text-sm font-mono placeholder-zinc-500 focus:outline-none transition-colors ${borderFocusClasses[accent]} ${error ? 'border-red-500' : ''} ${className}`.trim()}
        {...props}
      />
      {error && <span className="text-xs font-mono text-red-400 font-bold">&gt; {error}</span>}
      {!error && helperText && <span className="text-xs font-mono text-zinc-400">&gt; {helperText}</span>}
    </div>
  );
}

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  accent?: 'cyan' | 'pink' | 'yellow' | 'green';
  className?: string;
}

export function TextArea({ label, error, accent = 'cyan', className = '', id, ...props }: TextAreaProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full font-mono">
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`w-full bg-black text-white border-2 border-white p-4 text-sm font-mono placeholder-zinc-500 focus:outline-none transition-colors focus:border-brutalist-cyan ${error ? 'border-red-500' : ''} ${className}`.trim()}
        {...props}
      />
      {error && <span className="text-xs font-mono text-red-400 font-bold">&gt; {error}</span>}
    </div>
  );
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  accent?: 'cyan' | 'pink' | 'yellow' | 'green';
  className?: string;
}

export function Select({ label, options, accent = 'cyan', className = '', id, ...props }: SelectProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full font-mono">
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`w-full bg-black text-white border-2 border-white px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-brutalist-cyan cursor-pointer ${className}`.trim()}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-zinc-900 text-white">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Input;
