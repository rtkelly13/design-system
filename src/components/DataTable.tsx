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
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
  enableSorting?: boolean;
  sortValue?: (row: T) => any;
}

export type DataTableProps<T> =
  | {
      /** Pre-configured TanStack table instance */
      table: TanStackTable<T>;
      columns?: never;
      data?: never;
      keyExtractor?: (row: T, index: number) => string | number;
      emptyText?: string;
      className?: string;
      containerClassName?: string;
    }
  | {
      table?: never;
      /** Column definitions (either simple Column<T>[] or TanStack ColumnDef<T>[]) */
      columns: Column<T>[] | ColumnDef<T, any>[];
      data: T[];
      keyExtractor?: (row: T, index: number) => string | number;
      emptyText?: string;
      className?: string;
      containerClassName?: string;
      enableSorting?: boolean;
      pageSize?: number;
    };

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
