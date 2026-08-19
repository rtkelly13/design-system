import type { ReactNode } from 'react';
import { recipe } from '../lib/recipe';
import { childrenToText, slugify } from '../lib/slug';

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
    // `print:` keeps the document usable on paper, which is where a report
    // often ends up. Utilities rather than an `@media print` block, because a
    // stylesheet is not where styling lives here.
    root: 'mx-auto w-full max-w-4xl bg-surface-base px-6 py-12 font-body text-content-primary sm:px-8 print:max-w-none print:px-0 print:py-0',
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
  /**
   * Anchor for the section, so a reader can link straight to it. Derived from
   * the title when omitted — a generated report is often the thing someone
   * pastes into a ticket, and "see the Failures section" is worse than a URL.
   */
  id?: string;
  children: ReactNode;
  className?: string;
}

export function ReportSection({ title, id, children, className }: ReportSectionProps) {
  const anchor = id ?? slugify(childrenToText(title));
  return (
    <section id={anchor} className={`scroll-mt-4 break-inside-avoid ${className ?? ''}`.trim()}>
      <h2 className="mb-4 border-b-2 border-edge-subtle pb-2 font-display text-xl font-bold uppercase tracking-tight">
        {title}
      </h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

/**
 * A collapsible block, built on `<details>`.
 *
 * This is the one interactive affordance a static report can actually have.
 * Every other one — a sort control, a filter, a tab strip — needs client JS that
 * this pipeline does not emit, so it renders as a dead control; `<details>` is
 * disclosure implemented by the browser itself. That makes progressive
 * disclosure available to a generated report at all: a summary anyone can scan,
 * with the stack trace, the full diff or the 200-row table folded away until
 * someone wants it.
 *
 * `open` is worth setting on the block a reader came for. Printing a report
 * prints only what is open, which is usually right and occasionally surprising.
 */
export interface ReportDetailsProps {
  summary: ReactNode;
  /** Short right-aligned annotation on the summary row — a count, a duration. */
  note?: ReactNode;
  open?: boolean;
  children: ReactNode;
  className?: string;
}

export function ReportDetails({ summary, note, open, children, className }: ReportDetailsProps) {
  return (
    <details
      open={open}
      className={`group border-2 border-edge-strong bg-surface-raised ${className ?? ''}`.trim()}
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 font-mono text-sm font-bold text-content-primary marker:content-none hover:bg-surface-sunken">
        {/* Text, not an icon: the marker has to survive greyscale printing and a
            reader who cannot see colour. */}
        <span aria-hidden="true" className="text-accent-primary">
          <span className="group-open:hidden">[+]</span>
          <span className="hidden group-open:inline">[-]</span>
        </span>
        <span className="flex-1">{summary}</span>
        {note ? <span className="font-normal text-content-muted">{note}</span> : null}
      </summary>
      <div className="border-t-2 border-edge-subtle p-4">{children}</div>
    </details>
  );
}
