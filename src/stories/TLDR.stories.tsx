import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TLDR } from '../components/TLDR';

const meta: Meta<typeof TLDR> = {
  title: 'Foundations/TLDR',
  component: TLDR,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TLDR>;

/**
 * The intended shape: one sentence a reader can act on without reading the
 * article. Everything about the box is fixed — the icon, the `[ TL;DR ]` label,
 * the secondary accent — so this story is the whole API surface plus its
 * content.
 */
export const Default: Story = {
  args: {
    children:
      'Composition is resolved in the browser, so the composed Storybook has to send CORS headers on its index.',
  },
};

/** Longer summaries still read as a single block rather than a paragraph. */
export const Multiline: Story = {
  args: {
    children:
      'Adopt rather than manage anything already serving traffic. Import existing resources before the first apply, and treat a proposed domain deletion as a registry bug.',
  },
};

/**
 * `children` is nodes, not a string, so a summary that is really a list can be
 * one. This is the upper bound on what belongs here: past three or four points
 * the box has stopped summarising the article and started being it.
 */
export const WithList: Story = {
  render: () => (
    <TLDR>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        <li>Clean URLs must stay off — they drop the query string Storybook needs.</li>
        <li>Baselines are regenerated in the PR, never on main.</li>
        <li>A cancelled run is a six-hour timeout, not someone pressing a button.</li>
      </ul>
    </TLDR>
  ),
};
