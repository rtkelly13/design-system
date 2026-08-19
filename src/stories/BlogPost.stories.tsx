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
