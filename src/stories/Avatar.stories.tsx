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
    accent: 'primary',
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
    accent: 'tertiary',
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
      <Avatar fallback="SM" size="sm" accent="primary" />
      <Avatar fallback="MD" size="md" accent="secondary" />
      <Avatar fallback="LG" size="lg" accent="success" />
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

/**
 * The full role vocabulary, which `accent` only started accepting in #91 — the
 * top row is `Emphasis`, the bottom `Intent`. Before that this prop took the
 * four hue names alone, so half of these were a type error and an avatar could
 * not be given an intent at all.
 *
 * The legacy names still resolve identically (`cyan` is `primary`), so nothing
 * that already compiled has changed; they are simply no longer the only option.
 */
export const AccentRoles: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '0.75rem', width: 'max-content' }}>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Avatar fallback="PR" accent="primary" />
        <Avatar fallback="SE" accent="secondary" />
        <Avatar fallback="TE" accent="tertiary" />
        <Avatar fallback="QU" accent="quiet" />
      </div>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Avatar fallback="IN" accent="info" />
        <Avatar fallback="SU" accent="success" />
        <Avatar fallback="WA" accent="warning" />
        <Avatar fallback="DA" accent="danger" />
      </div>
    </div>
  ),
};
