import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SaasLandingPage } from '../components/saas/SaasLandingPage';
import { ThemeProvider } from '../components/ThemeProvider';

const meta: Meta<typeof SaasLandingPage> = {
  title: 'SaaS/LandingPage',
  tags: ['autodocs'],
  component: SaasLandingPage,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SaasLandingPage>;

/**
 * `midnight`. As with the admin shell, the theme level is this page's only real
 * axis — the section order is fixed and the copy comes from props with working
 * defaults, so what varies between useful versions of it is the rung.
 */
export const DarkMode: Story = {
  render: () => (
    <ThemeProvider defaultLevel="midnight" persist={false} followSystem={false}>
      <div className="bg-surface-base min-h-screen text-content-primary">
        <SaasLandingPage />
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
        <SaasLandingPage />
      </div>
    </ThemeProvider>
  ),
};

/**
 * `bright`. Worth checking a marketing page at the light end specifically: the
 * hero and the pricing tiers lean hardest on accent fills, which is where a
 * contrast problem shows up first.
 */
export const LiteMode: Story = {
  render: () => (
    <ThemeProvider defaultLevel="bright" scoped persist={false} followSystem={false} className="min-h-screen bg-surface-base text-content-primary">
      <div>
        <SaasLandingPage />
      </div>
    </ThemeProvider>
  ),
};
