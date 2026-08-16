import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SaasLandingPage } from '../components/saas/SaasLandingPage';
import { ThemeProvider } from '../components/ThemeProvider';

const meta: Meta<typeof SaasLandingPage> = {
  title: 'SaaS/LandingPage',
  component: SaasLandingPage,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SaasLandingPage>;

export const DarkMode: Story = {
  render: () => (
    <ThemeProvider defaultLevel="midnight" persist={false} followSystem={false}>
      <div className="bg-black min-h-screen text-white">
        <SaasLandingPage />
      </div>
    </ThemeProvider>
  ),
};

export const LiteMode: Story = {
  render: () => (
    <ThemeProvider defaultLevel="bright" scoped persist={false} followSystem={false} className="min-h-screen bg-surface-base text-content-primary">
      <div>
        <SaasLandingPage />
      </div>
    </ThemeProvider>
  ),
};
