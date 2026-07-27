import type { Meta, StoryObj } from '@storybook/react';
import { DesignSandbox } from '../components/experiments/DesignSandbox';

const meta: Meta<typeof DesignSandbox> = {
  title: 'Showcase/DesignSandbox',
  component: DesignSandbox,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DesignSandbox>;

export const DefaultSandbox: Story = {};
