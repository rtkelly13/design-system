import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type Table as TanStackTable,
} from '@tanstack/react-table';
import { useMemo, useState, type ReactNode } from 'react';
import { cn } from '../lib/recipe';
import { NerdIcon } from './NerdIcon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './Table';

// Legacy column interface for backwards-compatibility
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
  enableSorting?: boolean;
  sortValue?: (row: T) => any;
}

/**
 * Either a pre-built TanStack table, or columns and rows to build one from.
 *
 * A discriminated union rather than a bag of optional props, so the two modes
 * cannot be half-supplied: passing `table` alongside `columns` is a type error
 * rather than a silent precedence rule nobody remembers.
 */
export type DataTableProps<T> =
  | {
      /** Pre-configured TanStack table instance. */
      table: TanStackTable<T>;
      columns?: never;
      data?: never;
      /**
       * A stable identity per row, used as the React key.
       *
       * The row index is available as the second argument, but reaching for it
       * is how a re-sorted or filtered table ends up reusing the wrong DOM
       * node. Supply a real id where the data has one.
       */
      keyExtractor?: (row: T, index: number) => string | number;
      /**
       * Shown in place of the body when there are no rows. Worth setting per
       * table: "No deployments yet" tells the reader whether they are looking
       * at an empty system or an over-narrow filter, where the default cannot.
       */
      emptyText?: string;
      className?: string;
      containerClassName?: string;
    }
  | {
      table?: never;
      /** Column definitions — simple `Column<T>[]` or TanStack `ColumnDef<T>[]`. */
      columns: Column<T>[] | ColumnDef<T, any>[];
      /** The rows. An empty array renders `emptyText` rather than a bare header. */
      data: T[];
      /** See above — the index fallback is a decision, not a default. */
      keyExtractor?: (row: T, index: number) => string | number;
      /** Shown in place of the body when `data` is empty. */
      emptyText?: string;
      /** Extra classes on the scroll container that wraps the table. */
      className?: string;
      containerClassName?: string;
      enableSorting?: boolean;
      pageSize?: number;
    };

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
  table: providedTable,
  columns,
  data,
  keyExtractor,
  emptyText = 'No items found.',
  className = '',
  containerClassName = '',
  ...rest
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // Normalize columns if legacy format is provided
  const tanstackColumns = useMemo<ColumnDef<T, any>[]>(() => {
    if (!columns) return [];

    return columns.map((col: any) => {
      // Check if it's already a TanStack ColumnDef
      if ('accessorKey' in col || 'accessorFn' in col || 'id' in col) {
        return col as ColumnDef<T, any>;
      }

      // Convert legacy Column<T> to ColumnDef<T>
      const legacy = col as Column<T>;
      return {
        id: typeof legacy.accessor === 'string' ? legacy.accessor : legacy.header,
        header: legacy.header,
        enableSorting: legacy.enableSorting ?? true,
        accessorFn: (row: T) => {
          if (legacy.sortValue) {
            return legacy.sortValue(row);
          }
          if (typeof legacy.accessor === 'function') {
            const res = legacy.accessor(row);
            if (res && typeof res === 'object' && 'props' in (res as any)) {
              const children = (res as any).props?.children;
              if (typeof children === 'string' || typeof children === 'number') {
                return children;
              }
            }
            return typeof res === 'string' || typeof res === 'number' ? res : '';
          }
          return row[legacy.accessor];
        },
        cell: (info: any) => {
          if (typeof legacy.accessor === 'function') {
            return legacy.accessor(info.row.original);
          }
          return info.getValue() as ReactNode;
        },
        meta: {
          className: legacy.className,
        },
      } as ColumnDef<T, any>;
    });
  }, [columns]);

  const defaultTable = useReactTable<T>({
    data: data || [],
    columns: tanstackColumns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel:
      'pageSize' in rest && rest.pageSize ? getPaginationRowModel() : undefined,
  });

  const activeTable = providedTable || defaultTable;

  return (
    <Table className={className} containerClassName={containerClassName}>
      <TableHeader>
        {activeTable.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const canSort = header.column.getCanSort();
              const isSorted = header.column.getIsSorted();
              const meta = header.column.columnDef.meta as { className?: string } | undefined;

              return (
                <TableHead
                  key={header.id}
                  className={cn(
                    canSort && 'cursor-pointer select-none hover:bg-surface-base transition-colors',
                    meta?.className,
                  )}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {header.isPlaceholder ? null : (
                    <span className="inline-flex items-center gap-1.5">
                      <span>[</span>
                      <span>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </span>
                      {canSort && (
                        <span className="inline-flex items-center">
                          {isSorted === 'asc' ? (
                            <NerdIcon name="sort-asc" size="sm" accent="primary" label="Sorted Ascending" />
                          ) : isSorted === 'desc' ? (
                            <NerdIcon name="sort-desc" size="sm" accent="primary" label="Sorted Descending" />
                          ) : (
                            <NerdIcon name="sort" size="sm" accent="muted" label="Sortable" />
                          )}
                        </span>
                      )}
                      <span>]</span>
                    </span>
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {activeTable.getRowModel().rows.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={activeTable.getAllColumns().length || 1}
              className="px-4 py-8 text-center text-content-muted font-mono"
            >
              &gt; {emptyText}
            </TableCell>
          </TableRow>
        ) : (
          activeTable.getRowModel().rows.map((row, rowIdx) => {
            const rowKey = keyExtractor
              ? keyExtractor(row.original, rowIdx)
              : row.id;

            return (
              <TableRow key={rowKey} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta as { className?: string } | undefined;
                  return (
                    <TableCell key={cell.id} className={meta?.className}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}

export default DataTable;
