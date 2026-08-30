import type { ReactNode } from 'react';

export interface SectionContainerProps {
  /** The section's content. Rendered directly; this adds no padding of its own beyond the gutters. */
  children: ReactNode;
  /** Extra classes on the `<section>` — spacing, background, anything the measure does not own. */
  className?: string;
}

/**
 * The page's measure: centred, `max-w-3xl`, widening to `max-w-5xl` at `xl`.
 *
 * One job, deliberately. It owns the reading width and the side gutters and
 * nothing else — no vertical rhythm, no background, no border — so nesting one
 * inside another does nothing useful and stacking sections is just repeating
 * it. The `xl` step is why the number is not simply hardcoded at a call site:
 * change the measure here and every surface using it moves together.
 *
 * The width is chosen for prose. A data table or a dashboard grid wants the
 * viewport, so those belong outside it.
 *
 * ```tsx
 * <SectionContainer>
 *   <PageTitle>Release notes</PageTitle>
 *   <Prose>{children}</Prose>
 * </SectionContainer>
 * ```
 */
export function SectionContainer({ children, className = '' }: SectionContainerProps) {
  return (
    <section className={`mx-auto max-w-3xl px-4 sm:px-6 xl:max-w-5xl xl:px-0 ${className}`}>
      {children}
    </section>
  );
}

export default SectionContainer;
