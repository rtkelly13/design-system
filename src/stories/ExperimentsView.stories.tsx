import React from 'react';
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

/**
 * With a handler passed, the cards become interactive: the cursor changes and a
 * click reports the experiment's `id`. Compare the default story, where the
 * same grid is inert.
 */
export const WithSelectionHandler: Story = {
  args: { onSelectExperiment: () => {} },
};

/**
 * The catalogue is not configurable, so the axis this component actually varies
 * on is what a selection does. Here the handler reports back into the page, the
 * way a host router would.
 */
export const Interactive: Story = {
  render: function Render() {
    const [selected, setSelected] = React.useState<string | null>(null);
    return (
      <div>
        <p style={{ padding: '1rem', fontFamily: 'var(--ds-font-mono)' }}>
          Selected: {selected ?? '(none yet)'}
        </p>
        <ExperimentsView onSelectExperiment={setSelected} />
      </div>
    );
  },
};
