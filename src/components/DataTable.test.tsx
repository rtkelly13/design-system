import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DataTable } from './DataTable';

interface TestItem {
  id: string;
  name: string;
  count: number;
}

const testData: TestItem[] = [
  { id: '1', name: 'Zeta', count: 42 },
  { id: '2', name: 'Alpha', count: 10 },
  { id: '3', name: 'Beta', count: 99 },
];

describe('DataTable', () => {
  it('renders simple column definitions and data rows', () => {
    render(
      <DataTable
        columns={[
          { header: 'Name', accessor: 'name' },
          { header: 'Count', accessor: 'count' },
        ]}
        data={testData}
        keyExtractor={(row) => row.id}
      />,
    );

    expect(screen.getByText('Name')).toBeDefined();
    expect(screen.getByText('Count')).toBeDefined();
    expect(screen.getByText('Zeta')).toBeDefined();
    expect(screen.getByText('Alpha')).toBeDefined();
    expect(screen.getByText('Beta')).toBeDefined();
  });

  it('renders custom empty message when data is empty', () => {
    render(
      <DataTable
        columns={[{ header: 'Name', accessor: 'name' }]}
        data={[]}
        emptyText="Nothing in the registry."
      />,
    );

    expect(screen.getByText('> Nothing in the registry.')).toBeDefined();
  });

  it('sorts rows when clicking sortable column header', () => {
    render(
      <DataTable
        columns={[
          { header: 'Name', accessor: 'name' },
          { header: 'Count', accessor: 'count' },
        ]}
        data={testData}
      />,
    );

    const nameHeader = screen.getByText('Name');

    // Click to sort ASC (Alpha, Beta, Zeta)
    fireEvent.click(nameHeader);
    expect(screen.getByText('▲')).toBeDefined();

    const rowsAfterAsc = screen.getAllByRole('row');
    // First row is the header row, so row 1 is Alpha
    expect(rowsAfterAsc[1].textContent).toContain('Alpha');
    expect(rowsAfterAsc[2].textContent).toContain('Beta');
    expect(rowsAfterAsc[3].textContent).toContain('Zeta');

    // Click to sort DESC (Zeta, Beta, Alpha)
    fireEvent.click(nameHeader);
    expect(screen.getByText('▼')).toBeDefined();

    const rowsAfterDesc = screen.getAllByRole('row');
    expect(rowsAfterDesc[1].textContent).toContain('Zeta');
    expect(rowsAfterDesc[2].textContent).toContain('Beta');
    expect(rowsAfterDesc[3].textContent).toContain('Alpha');
  });

  it('accepts an externally controlled TanStack table instance', () => {
    function ControlledTableWrapper() {
      const table = useReactTable({
        data: testData,
        columns: [
          {
            accessorKey: 'name',
            header: 'Cluster Node',
          },
          {
            accessorKey: 'count',
            header: 'Cores',
          },
        ],
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
      });

      return <DataTable table={table} />;
    }

    render(<ControlledTableWrapper />);

    expect(screen.getByText('Cluster Node')).toBeDefined();
    expect(screen.getByText('Zeta')).toBeDefined();
    expect(screen.getByText('42')).toBeDefined();
  });

  it('addresses semantic roles and emits no forbidden colour literals', () => {
    const FORBIDDEN =
      /brutalist-|--color-white|--border-color|zinc-|-red-\d|bg-black|text-white|border-white/;

    const { container } = render(
      <DataTable
        columns={[
          { header: 'Node', accessor: 'name' },
          { header: 'Value', accessor: 'count' },
        ]}
        data={testData}
      />,
    );

    for (const node of container.querySelectorAll<HTMLElement>('*')) {
      expect(node.className, `${node.tagName} pins a palette entry`).not.toMatch(
        FORBIDDEN,
      );
    }
  });
});
