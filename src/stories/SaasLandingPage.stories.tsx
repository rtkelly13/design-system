import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SaasLandingPage } from '../components/saas/SaasLandingPage';
import { ThemeProvider } from '../components/ThemeProvider';

const meta: Meta<typeof SaasLandingPage> = {
  title: 'SaaS/LandingPage',
  component: SaasLandingPage,
};

export default meta;
type Story = StoryObj<typeof SaasLandingPage>;

export const DefaultLandingPage: Story = {
  render: () => (
    <ThemeProvider defaultTheme="dark">
      <SaasLandingPage />
    </ThemeProvider>
  ),
};
