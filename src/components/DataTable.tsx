import type { ReactNode } from 'react';
import { cn } from '../lib/recipe';

export interface Column<T> {
  /** Column label, rendered bracketed and uppercased in the header row. */
  header: string;
  /**
   * Where the cell's content comes from: a key of the row for a plain value,
   * or a function returning nodes for anything else — a `Badge`, a link, a
   * formatted date. The function form is what keeps formatting out of the data.
   */
  accessor: keyof T | ((row: T) => ReactNode);
  /** Extra classes applied to this column's header cell and every body cell in it. */
  className?: string;
}

export interface DataTableProps<T> {
  /** Column definitions, in display order. */
  columns: Column<T>[];
  /** The rows. An empty array renders `emptyText` rather than a bare header. */
  data: T[];
  /**
   * A stable identity per row, used as the React key.
   *
   * Required rather than optional, and deliberately so: the index is available
   * as the second argument if a row genuinely has no id, but making that the
   * default is how re-sorted or filtered tables end up reusing the wrong DOM
   * node. Asking for the id makes the fallback a decision.
   */
  keyExtractor: (row: T, index: number) => string | number;
  /**
   * Shown in place of the body when `data` is empty. Worth setting per table:
   * "No deployments yet" tells the reader whether they are looking at an empty
   * system or an over-narrow filter, where the default cannot.
   */
  emptyText?: string;
  /** Extra classes on the scroll container that wraps the table. */
  className?: string;
}

/**
 * A bordered table for tabular data, generic over the row type.
 *
 * `Column<T>` is where the work happens. An `accessor` that is a key of `T`
 * prints the value; an `accessor` that is a function returns nodes, which is
 * how a status column becomes a `Badge` and a name column becomes a link
 * without this component knowing anything about either. Type inference flows
 * from `data`, so a mistyped key is a compile error rather than an empty cell.
 *
 * The wrapper scrolls horizontally rather than wrapping cells, because a
 * brutalist table with a 2px grid loses its structure the moment rows differ
 * in height. Wide tables scroll; they do not reflow.
 *
 * ```tsx
 * <DataTable
 *   data={deployments}
 *   keyExtractor={(row) => row.id}
 *   emptyText="No deployments in the last 30 days."
 *   columns={[
 *     { header: 'Branch', accessor: 'branch' },
 *     { header: 'State', accessor: (row) => <Badge accent={ACCENT[row.state]}>{row.state}</Badge> },
 *   ]}
 * />
 * ```
 */
export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyText = 'No items found.',
  className = '',
}: DataTableProps<T>) {
  return (
    <div
      className={cn(
        'overflow-x-auto border-2 border-edge-strong bg-surface-base',
        className,
      )}
    >
      <table className="w-full text-left font-mono border-collapse">
        <thead>
          <tr className="bg-surface-raised border-b-2 border-edge-strong text-xs font-bold uppercase tracking-wider text-accent-primary">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={cn(
                  'px-4 py-3 border-r-2 border-edge-strong last:border-r-0',
                  col.className,
                )}
              >
                [ {col.header} ]
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-edge-strong text-sm text-content-primary">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-content-muted font-mono">
                &gt; {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr key={keyExtractor(row, rowIdx)} className="hover:bg-surface-raised transition-colors">
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={cn(
                      'px-4 py-3 border-r-2 border-edge-strong last:border-r-0',
                      col.className,
                    )}
                  >
                    {typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
