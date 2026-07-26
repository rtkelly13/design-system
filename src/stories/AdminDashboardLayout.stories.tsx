import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AdminDashboardLayout } from '../components/admin/AdminDashboardLayout';
import { ThemeProvider } from '../components/ThemeProvider';

const meta: Meta<typeof AdminDashboardLayout> = {
  title: 'SaaS/AdminDashboardLayout',
  component: AdminDashboardLayout,
};

export default meta;
type Story = StoryObj<typeof AdminDashboardLayout>;

export const DefaultAdminDashboard: Story = {
  render: () => (
    <ThemeProvider defaultTheme="dark">
      <AdminDashboardLayout />
    </ThemeProvider>
  ),
};
