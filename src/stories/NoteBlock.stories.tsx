import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { NoteBlock } from '../components/NoteBlock';

const meta: Meta<typeof NoteBlock> = {
  title: 'Foundations/NoteBlock',
  component: NoteBlock,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NoteBlock>;

/** `note` — context the reader can skip without losing the thread. Info role. */
export const Note: Story = {
  args: {
    type: 'note',
    children: 'Branch domains map to exactly one branch; per-PR builds keep their generated URLs.',
  },
};

/** `tip` — an optional advantage. Success role, so it reads as a good outcome rather than a requirement. */
export const Tip: Story = {
  args: {
    type: 'tip',
    children: 'Leaving the composition ref unset composes nothing, which is what you want locally.',
  },
};

/**
 * `warning` — the strongest of the four, and it uses the **danger** role. Note
 * that the names are not in the order they suggest: this outranks `important`.
 */
export const Warning: Story = {
  args: {
    type: 'warning',
    children: 'A preview that proposes deleting a domain is a bug in the registry, not something to apply.',
  },
};

/**
 * `important` — something the reader must know, on the warning role. Also shows
 * `title` overriding the default heading: the icon and colour do not change
 * with it, so use it to say *what*, not to re-badge the severity.
 */
export const Important: Story = {
  args: {
    type: 'important',
    title: 'Read before applying',
    children: 'Existing resources must be imported first — declaring them makes the provider try to create them.',
  },
};

/** All four together, which is how the severity ramp is actually judged. */
export const AllTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <NoteBlock type="note">A neutral aside.</NoteBlock>
      <NoteBlock type="tip">Something worth doing.</NoteBlock>
      <NoteBlock type="warning">Something that bites.</NoteBlock>
      <NoteBlock type="important">Something that must not be skipped.</NoteBlock>
    </div>
  ),
};
