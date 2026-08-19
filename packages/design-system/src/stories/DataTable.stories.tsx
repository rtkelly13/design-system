import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataTable } from '../components/DataTable';
import { Badge } from '../components/Badge';

interface Deployment {
  id: string;
  branch: string;
  state: 'ready' | 'building' | 'error';
  duration: string;
}

const rows: Deployment[] = [
  { id: 'dpl_1', branch: 'main', state: 'ready', duration: '1m 12s' },
  { id: 'dpl_2', branch: 'preview', state: 'building', duration: '—' },
  { id: 'dpl_3', branch: 'fix/theme', state: 'error', duration: '0m 41s' },
];

const STATE_ACCENT = { ready: 'success', building: 'info', error: 'danger' } as const;

const meta: Meta<typeof DataTable<Deployment>> = {
  title: 'Foundations/DataTable',
  component: DataTable,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DataTable<Deployment>>;

export const Default: Story = {
  args: {
    data: rows,
    keyExtractor: (row) => row.id,
    columns: [
      { header: 'BRANCH', accessor: 'branch' },
      { header: 'STATE', accessor: 'state' },
      { header: 'DURATION', accessor: 'duration' },
    ],
  },
};

/** An `accessor` function renders arbitrary nodes, not just field values. */
export const WithRenderedCells: Story = {
  args: {
    data: rows,
    keyExtractor: (row) => row.id,
    columns: [
      { header: 'BRANCH', accessor: 'branch' },
      {
        header: 'STATE',
        accessor: (row) => <Badge accent={STATE_ACCENT[row.state]}>{row.state.toUpperCase()}</Badge>,
      },
      { header: 'DURATION', accessor: 'duration' },
    ],
  },
};

export const Empty: Story = {
  args: {
    data: [],
    keyExtractor: (row) => row.id,
    emptyText: 'NO DEPLOYMENTS YET',
    columns: [
      { header: 'BRANCH', accessor: 'branch' },
      { header: 'STATE', accessor: 'state' },
    ],
  },
};
