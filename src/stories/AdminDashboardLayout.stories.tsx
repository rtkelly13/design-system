import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdminDashboardLayout } from '../components/admin/AdminDashboardLayout';
import { ThemeProvider } from '../components/ThemeProvider';

const meta: Meta<typeof AdminDashboardLayout> = {
  title: 'SaaS/AdminDashboardLayout',
  component: AdminDashboardLayout,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof AdminDashboardLayout>;

export const DarkMode: Story = {
  render: () => (
    <ThemeProvider defaultLevel="midnight" persist={false} followSystem={false}>
      <div className="bg-surface-base min-h-screen text-content-primary">
        <AdminDashboardLayout />
      </div>
    </ThemeProvider>
  ),
};

/**
 * The middle of the dark half of the ladder. `midnight` is the maximal end and
 * `bright` the paper end; this rung is the one meant to be read in for a long
 * time, which is what an admin surface actually is.
 */
export const DimMode: Story = {
  render: () => (
    <ThemeProvider
      defaultLevel="dim"
      scoped
      persist={false}
      followSystem={false}
      className="min-h-screen bg-surface-base text-content-primary"
    >
      <div>
        <AdminDashboardLayout />
      </div>
    </ThemeProvider>
  ),
};

export const LiteMode: Story = {
  render: () => (
    <ThemeProvider defaultLevel="bright" scoped persist={false} followSystem={false} className="min-h-screen bg-surface-base text-content-primary">
      <div>
        <AdminDashboardLayout />
      </div>
    </ThemeProvider>
  ),
};
