import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slide } from '../components/slides/Slide';
import { BracketText } from '../components/BracketText';

const meta: Meta<typeof Slide> = {
  title: 'Presentation/Slide',
  component: Slide,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof Slide>;

/** A single slide. `SlideDeck` composes these with navigation around them. */
export const Default: Story = {
  args: {
    title: 'One stack, three modes',
    children: <p>Dark, dim and sketch resolve from the same semantic layer.</p>,
  },
};

/**
 * `subtitle` sits under the title inside the ruled header. Both are optional:
 * omitting them gives a full-bleed frame, which is what a title card or an
 * image slide wants.
 */
export const WithSubtitle: Story = {
  args: {
    title: 'Composition',
    subtitle: 'One URL, two tiers',
    children: (
      <p>
        The system publishes primitives; the site documents what it builds on top —{' '}
        <BracketText accent="primary">ryankelly.dev (site)</BracketText>.
      </p>
    ),
  },
};

/**
 * `speakerNotes` is accepted and **renders nothing** — there is no presenter
 * view in this package yet, and `SlideDeck` does not read it either. It exists
 * so a deck can carry its notes with its content. Nothing in it reaches the
 * audience, and nothing in it reaches the presenter either, for now.
 */
export const WithSpeakerNotes: Story = {
  args: {
    title: 'Adopt, do not manage',
    children: <p>Adoption cannot delete what it does not own.</p>,
    speakerNotes: 'Mention that import is mandatory: declaring an existing domain tries to create it.',
  },
};
