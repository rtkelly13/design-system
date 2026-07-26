import React from 'react';

export interface AsciiDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  pattern?: string;
}

export const AsciiDivider: React.FC<AsciiDividerProps> = ({
  pattern = '//====================================================//',
  className = '',
  style,
  ...props
}) => {
  return (
    <div className={`ascii-divider ${className}`} style={{ margin: '1.5rem 0', ...style }} {...props}>
      {pattern}
    </div>
  );
};
