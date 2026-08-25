import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExperimentsView } from '../components/experiments/ExperimentsView';

const meta: Meta<typeof ExperimentsView> = {
  title: 'Showcase/ExperimentsView',
  component: ExperimentsView,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof ExperimentsView>;

/** Renders its own catalogue; `onSelectExperiment` is the only input. */
export const Default: Story = {};

export const WithSelectionHandler: Story = {
  args: { onSelectExperiment: () => {} },
};
