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
      <div className="bg-black min-h-screen text-white">
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
