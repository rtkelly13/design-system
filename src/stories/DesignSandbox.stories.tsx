import type { Meta, StoryObj } from '@storybook/react-vite';
import { DesignSandbox } from '../components/experiments/DesignSandbox';

const meta: Meta<typeof DesignSandbox> = {
  title: 'Showcase/DesignSandbox',
  tags: ['autodocs'],
  component: DesignSandbox,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DesignSandbox>;

/**
 * Every component in the package on one page. The point is the theme toolbar
 * above: switching levels over this story is the fastest check that a token
 * change holds across the whole inventory, which no single-component story can
 * show.
 *
 * Excluded from the gated visual suite deliberately — it changes whenever
 * anything does, so a baseline over it would fail constantly while localising
 * nothing.
 */
export const DefaultSandbox: Story = {};
