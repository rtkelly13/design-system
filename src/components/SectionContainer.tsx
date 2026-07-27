import type { ReactNode } from 'react';

export interface SectionContainerProps {
  children: ReactNode;
  className?: string;
}

export function SectionContainer({ children, className = '' }: SectionContainerProps) {
  return (
    <section className={`mx-auto max-w-3xl px-4 sm:px-6 xl:max-w-5xl xl:px-0 ${className}`}>
      {children}
    </section>
  );
}

export default SectionContainer;
