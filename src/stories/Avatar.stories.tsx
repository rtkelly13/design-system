import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from '../components/Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Foundations/Avatar',
  component: Avatar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Avatar>;

/**
 * The no-image case, which is the common one: initials in the accent colour on
 * the surface, so an avatar is never an empty box while a photo 404s.
 */
export const Default: Story = {
  args: {
    fallback: 'RK',
    accent: 'cyan',
    size: 'md',
  },
};

/**
 * `accent` colours the offset shadow and the initials together. It is
 * identity, not status — pick one per person or per source and keep it stable,
 * because an avatar that changes colour reads as a different person.
 */
export const PinkAccent: Story = {
  args: {
    fallback: 'AI',
    accent: 'pink',
    size: 'lg',
  },
};

/**
 * The three sizes side by side, which is the comparison that matters: `sm` for
 * a byline, `md` for a list row, `lg` for a profile header. The offset shadow
 * stays 3px at all three, so the chip gets bigger while the brutalist detail
 * does not scale with it — deliberate, and the reason there is no `xl`.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
      <Avatar fallback="SM" size="sm" accent="cyan" />
      <Avatar fallback="MD" size="md" accent="yellow" />
      <Avatar fallback="LG" size="lg" accent="green" />
    </div>
  ),
};

/**
 * With an image, `alt` is doing real work: it is the person's name, not the
 * word "Avatar". The default exists so the element is never unlabelled, not so
 * it can be left alone.
 */
export const WithImage: Story = {
  args: {
    // `currentColor` inside a standalone SVG document resolves against that
    // document's own `color`, so the silhouette is deterministic without this
    // fixture naming a colour the theme does not own.
    src: 'data:image/svg+xml;utf8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56">' +
      '<circle cx="28" cy="21" r="9" fill="currentColor"/>' +
      '<path d="M8 56c0-11 9-18 20-18s20 7 20 18z" fill="currentColor"/></svg>',
    ),
    alt: 'Ryan Kelly',
    size: 'lg',
  },
};
