import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdminDashboardLayout } from '../components/admin/AdminDashboardLayout';
import { ThemeProvider } from '../components/ThemeProvider';

const meta: Meta<typeof AdminDashboardLayout> = {
  title: 'SaaS/AdminDashboardLayout',
  tags: ['autodocs'],
  component: AdminDashboardLayout,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof AdminDashboardLayout>;

/**
 * `midnight`, the maximal end of the ladder. The level is this page's axis of
 * variation because the layout itself takes almost no props — what changes
 * between an admin surface's three useful appearances is which rung it is on.
 */
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

/**
 * `bright` — warm paper. The interesting thing here is not that it is lighter
 * but that nothing in the layout was told: every surface, rule and accent
 * resolves from the same role tokens the dark stories use.
 */
export const LiteMode: Story = {
  render: () => (
    <ThemeProvider defaultLevel="bright" scoped persist={false} followSystem={false} className="min-h-screen bg-surface-base text-content-primary">
      <div>
        <AdminDashboardLayout />
      </div>
    </ThemeProvider>
  ),
};
