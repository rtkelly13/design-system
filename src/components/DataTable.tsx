import type { ReactNode } from 'react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  emptyText?: string;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyText = 'No items found.',
  className = '',
}: DataTableProps<T>) {
  return (
    <div className={`overflow-x-auto border-2 border-white bg-black ${className}`.trim()}>
      <table className="w-full text-left font-mono border-collapse">
        <thead>
          <tr className="bg-zinc-900 border-b-2 border-white text-xs font-bold uppercase tracking-wider text-brutalist-cyan">
            {columns.map((col, idx) => (
              <th key={idx} className={`px-4 py-3 border-r-2 border-white last:border-r-0 ${col.className || ''}`}>
                [ {col.header} ]
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-white text-sm text-white">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-zinc-400 font-mono">
                &gt; {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr key={keyExtractor(row, rowIdx)} className="hover:bg-zinc-900/60 transition-colors">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`px-4 py-3 border-r-2 border-white last:border-r-0 ${col.className || ''}`}>
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
