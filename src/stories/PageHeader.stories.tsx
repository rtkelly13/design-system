import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Terminal } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/Badge';

const meta: Meta<typeof PageHeader> = {
  title: 'Foundations/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

/**
 * Title only. The band is `bg-surface-raised` rather than the page ground,
 * which is what separates it from the content below without a rule.
 */
export const Default: Story = {
  args: { title: 'Deployments' },
};

/**
 * `subtitle` renders after a `>` prompt glyph in the accent colour — the one
 * terminal device in this component. The title itself stays
 * `--ds-text-primary`, which keeps the band readable when `accent` is a
 * low-contrast role like `quiet`.
 */
export const WithSubtitle: Story = {
  args: {
    title: 'Deployments',
    subtitle: 'Every build, newest first',
  },
};

/** `icon` takes a component, not an element — the header sizes it itself. */
export const WithIcon: Story = {
  args: {
    title: 'Console',
    subtitle: 'Streaming build output',
    icon: Terminal,
    accent: 'info',
  },
};

/** `children` sits below the subtitle, for badges and notes. */
export const WithChildren: Story = {
  render: () => (
    <PageHeader title="Deployments" subtitle="Every build, newest first" accent="primary">
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Badge accent="success">14 PASSING</Badge>
        <Badge accent="warning">1 SKIPPED</Badge>
      </div>
    </PageHeader>
  ),
};
