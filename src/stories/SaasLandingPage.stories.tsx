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
    <ThemeProvider defaultTheme="dark">
      <div className="bg-black min-h-screen text-white">
        <SaasLandingPage />
      </div>
    </ThemeProvider>
  ),
};

export const LiteMode: Story = {
  render: () => (
    <ThemeProvider defaultTheme="sketch">
      <div className="bg-[#fcfbf9] min-h-screen text-[#18181b] sketch">
        <SaasLandingPage />
      </div>
    </ThemeProvider>
  ),
};
