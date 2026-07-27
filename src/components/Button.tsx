import type { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from 'react';

export interface ButtonProps
  extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  children: ReactNode;
  variant?: 'cyan' | 'pink' | 'yellow' | 'white' | 'default';
  size?: 'sm' | 'md' | 'lg';
  bracketed?: boolean;
  className?: string;
}

export function Button({
  children,
  variant = 'pink',
  size = 'md',
  bracketed = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'font-mono font-bold uppercase border-2 transition-all duration-200';

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantStyles = {
    cyan: 'bg-brutalist-cyan text-black border-white shadow-hard-md hover:shadow-hard-lg active:translate-x-1 active:translate-y-1 active:shadow-none',
    pink: 'bg-brutalist-pink text-black border-white shadow-hard-md hover:shadow-hard-lg active:translate-x-1 active:translate-y-1 active:shadow-none',
    yellow: 'bg-brutalist-yellow text-black border-white shadow-hard-md hover:shadow-hard-lg active:translate-x-1 active:translate-y-1 active:shadow-none',
    white: 'bg-white text-black border-black shadow-hard-md hover:shadow-hard-lg active:translate-x-1 active:translate-y-1 active:shadow-none',
    default: 'bg-brutalist-cyan text-black border-white shadow-hard-md hover:shadow-hard-lg active:translate-x-1 active:translate-y-1 active:shadow-none',
  };

  const variantKey = variant === 'default' ? 'cyan' : variant;

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variantKey]} ${className}`.trim()}
      {...props}
    >
      {bracketed ? (
        <span className="inline-flex items-center justify-center gap-2">
          <span className="bracket-glyph select-none" aria-hidden="true">[</span>
          <span className="inline-flex items-center gap-2">{children}</span>
          <span className="bracket-glyph select-none" aria-hidden="true">]</span>
        </span>
      ) : (
        <span className="inline-flex items-center justify-center gap-2">{children}</span>
      )}
    </button>
  );
}

export default Button;
