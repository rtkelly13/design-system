import type {
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from 'react';
import { cn, recipe } from '../lib/recipe';

const tableStyles = recipe({
  slots: {
    container: 'relative w-full overflow-x-auto border-2 border-edge-strong bg-surface-base',
    table: 'w-full caption-bottom text-left font-mono text-sm border-collapse',
    header: 'bg-surface-raised border-b-2 border-edge-strong',
    head: 'h-11 px-4 py-3 text-left align-middle font-display text-xs font-bold uppercase tracking-wider text-accent-primary border-r-2 border-edge-strong last:border-r-0',
    body: 'divide-y-2 divide-edge-strong [&_tr:last-child]:border-0',
    row: 'border-b-2 border-edge-strong transition-colors hover:bg-surface-raised data-[state=selected]:bg-surface-raised',
    cell: 'px-4 py-3 align-middle text-sm text-content-primary border-r-2 border-edge-strong last:border-r-0',
    footer: 'bg-surface-raised border-t-2 border-edge-strong font-mono text-xs font-bold text-content-primary',
    caption: 'mt-3 text-xs font-mono text-content-muted text-center',
  },
});

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /**
   * Extra classes on the scroll container that wraps the table — the element
   * that owns the overflow, not the `<table>` itself. Use `className` for that.
   */
  containerClassName?: string;
}

/**
 * A table, as eight composable parts rather than one configured component.
 *
 * `DataTable` takes columns and data and decides the markup for you, which is
 * right until a cell needs to be a link, a row needs a colspan, or a footer
 * needs to total a column. These parts are the escape hatch: each is a thin
 * wrapper over the corresponding HTML element carrying the system's borders and
 * type and nothing else, so the caller writes real table markup and keeps the
 * semantics browsers and screen readers depend on.
 *
 * `Table` renders the scroll container as well as the `<table>`, because a
 * table overflowing its column is the most common way one breaks a page.
 */
export function Table({
  className,
  containerClassName,
  ...props
}: TableProps) {
  const styles = tableStyles();
  return (
    <div className={styles.container({ class: containerClassName })}>
      <table className={styles.table({ class: className })} {...props} />
    </div>
  );
}

export function TableHeader({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  const styles = tableStyles();
  return <thead className={styles.header({ class: className })} {...props} />;
}

export function TableBody({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  const styles = tableStyles();
  return <tbody className={styles.body({ class: className })} {...props} />;
}

export function TableFooter({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  const styles = tableStyles();
  return <tfoot className={styles.footer({ class: className })} {...props} />;
}

export function TableRow({
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  const styles = tableStyles();
  return <tr className={styles.row({ class: className })} {...props} />;
}

export function TableHead({
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  const styles = tableStyles();
  return <th className={styles.head({ class: className })} {...props} />;
}

export function TableCell({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  const styles = tableStyles();
  return <td className={styles.cell({ class: className })} {...props} />;
}

export function TableCaption({
  className,
  ...props
}: HTMLAttributes<HTMLTableCaptionElement>) {
  const styles = tableStyles();
  return <caption className={styles.caption({ class: className })} {...props} />;
}
