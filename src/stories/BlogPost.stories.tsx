import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { BlogPost } from '../components/blog/BlogPost';

const meta: Meta<typeof BlogPost> = {
  title: 'Blog/BlogPost',
  component: BlogPost,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof BlogPost>;

/**
 * The minimum: a title, a date and a body. Everything else in the header came
 * from a default, which is exactly the trap the third story documents.
 */
export const Default: Story = {
  args: {
    title: 'Where a theme stops applying',
    date: '2026-08-11',
    children: (
      <p>
        A custom property substitutes where it is declared, not where it is used — which decides
        whether a nested panel keeps its own theme or inherits the root&rsquo;s.
      </p>
    ),
  },
};

/**
 * Every field supplied, which is how a real post should call it. The body here
 * is bare `<p>` elements — the shell applies no typography of its own, so
 * Markdown output belongs inside a `Prose` scope within it.
 */
export const FullMetadata: Story = {
  args: {
    title: 'Where a theme stops applying',
    subtitle: 'Nested panels, var() substitution, and one line of CSS',
    author: 'Ryan Kelly',
    date: '2026-08-11',
    readingTime: '6 min read',
    tags: ['css', 'design-systems'],
    children: (
      <>
        <p>Re-declaring the indirected tokens on the mode classes re-runs substitution at the panel.</p>
        <p>Without it, utilities resolve to whatever the root theme happened to compute.</p>
      </>
    ),
  },
};

/**
 * The two content defaults made visible.
 *
 * `readingTime` and `tags` are both optional with plausible-looking defaults —
 * `'5 min read'` and a three-tag sample set — so a post that omits them
 * publishes a claim nobody made. This story passes neither, which is why the
 * header reads as though it were measured. Treat both as required in real use;
 * `tags={[]}` is how you say "none".
 */
export const DefaultsAreNotMeasurements: Story = {
  args: {
    title: 'A post that supplied no metadata',
    date: '2026-08-30',
    children: (
      <p>
        Everything in the header except the title and the date came from a default, including a
        reading time that no one calculated and three topics this post is not about.
      </p>
    ),
  },
};
