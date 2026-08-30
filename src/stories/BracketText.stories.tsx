import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { BracketText } from '../components/BracketText';

const meta: Meta<typeof BracketText> = {
  title: 'Foundations/BracketText',
  component: BracketText,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BracketText>;

/**
 * With no `accent`, the brackets and the text inherit the surrounding colour —
 * which is what makes this safe to drop inside a heading or a button label
 * without it fighting the type it lands in.
 */
export const Default: Story = {
  args: { children: 'SYSTEM READY' },
};

/**
 * The emphasis roles, top to bottom in descending prominence. `white` is the
 * maximum-contrast option and resolves to `--ds-text-primary`, so on the light
 * rungs of the ladder it renders near-black — switch the toolbar to `white` and
 * the bottom row inverts while the rest hold their hue.
 */
export const Emphasis: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <BracketText accent="primary">PRIMARY</BracketText>
      <BracketText accent="secondary">SECONDARY</BracketText>
      <BracketText accent="quiet">QUIET</BracketText>
      <BracketText accent="white">WHITE</BracketText>
    </div>
  ),
};

/** Inline in running text, which is where the bracket glyphs earn their keep. */
export const Inline: Story = {
  render: () => (
    <p style={{ maxWidth: '40ch', lineHeight: 1.7 }}>
      Deployment finished and the surface is <BracketText accent="success">LIVE</BracketText> — the
      previous build stays reachable until the alias moves.
    </p>
  ),
};
