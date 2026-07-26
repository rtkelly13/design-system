import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'cyan' | 'pink' | 'yellow' | 'default';
  bracketed?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  bracketed = false,
  children,
  className = '',
  style,
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'pink': return 'brutalist-btn brutalist-btn-pink';
      default: return 'brutalist-btn';
    }
  };

  return (
    <button className={`${getVariantClass()} ${className}`} style={style} {...props}>
      {bracketed ? `[ ${children} ]` : children}
    </button>
  );
};
