import type { ReactNode } from 'react';
import { recipe } from '../lib/recipe';

/**
 * The page frame for a generated report: a titled header with a metadata strip,
 * and a body that spaces its own sections.
 *
 * It exists so an agent writing a report has one obvious starting point rather
 * than a layout decision. Everything inside is ordinary composition — `Card`,
 * `StatCard`, `DataTable`, `NoteBlock`, `Prose` — and the frame only owns the
 * measure, the header and the vertical rhythm.
 *
 * Every colour addresses a role, so the same markup renders on all four rungs of
 * the ladder and the generator's `--theme` flag is the only thing that decides.
 */

const document_ = recipe({
  slots: {
    root: 'mx-auto w-full max-w-4xl bg-surface-base px-6 py-12 font-body text-content-primary sm:px-8',
    header: 'mb-10 border-b-4 border-edge-strong pb-6',
    title: 'font-display text-3xl font-bold uppercase leading-tight tracking-tight sm:text-4xl',
    subtitle: 'mt-3 max-w-2xl font-body text-base text-content-secondary',
    meta: 'mt-6 flex flex-wrap gap-x-8 gap-y-3',
    metaItem: 'flex flex-col gap-0.5',
    metaLabel: 'font-mono text-[0.6875rem] font-bold uppercase tracking-widest text-content-muted',
    metaValue: 'font-mono text-sm text-content-secondary',
    body: 'flex flex-col gap-8',
  },
});

/** One `label`/`value` pair in the header strip — a run date, a commit, a scope. */
export interface ReportMetaItem {
  label: string;
  value: ReactNode;
}

export interface ReportDocumentProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Rendered as a definition strip under the title. Omit for none. */
  meta?: readonly ReportMetaItem[];
  children: ReactNode;
  className?: string;
}

export function ReportDocument({ title, subtitle, meta, children, className }: ReportDocumentProps) {
  const styles = document_({ class: className });

  return (
    <article className={styles.root()}>
      <header className={styles.header()}>
        <h1 className={styles.title()}>{title}</h1>
        {subtitle ? <p className={styles.subtitle()}>{subtitle}</p> : null}
        {meta && meta.length > 0 ? (
          <dl className={styles.meta()}>
            {meta.map((item) => (
              <div key={item.label} className={styles.metaItem()}>
                <dt className={styles.metaLabel()}>{item.label}</dt>
                <dd className={styles.metaValue()}>{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </header>
      <div className={styles.body()}>{children}</div>
    </article>
  );
}

/**
 * A titled section inside a report. Headings carry the display font from
 * `styles.css`, so this only owns the rule above and the spacing.
 */
export interface ReportSectionProps {
  title: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ReportSection({ title, children, className }: ReportSectionProps) {
  return (
    <section className={className}>
      <h2 className="mb-4 border-b-2 border-edge-subtle pb-2 font-display text-xl font-bold uppercase tracking-tight">
        {title}
      </h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}
