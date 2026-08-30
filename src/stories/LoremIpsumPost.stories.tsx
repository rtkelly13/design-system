import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { LoremIpsumPost } from '../components/blog/LoremIpsumPost';
import { ThemeProvider } from '../components/ThemeProvider';

const meta: Meta<typeof LoremIpsumPost> = {
  title: 'Blog/LoremIpsumPost',
  tags: ['autodocs'],
  component: LoremIpsumPost,
};

export default meta;
type Story = StoryObj<typeof LoremIpsumPost>;

/**
 * The prose specimen, full page. It is the one full-page baseline the gated
 * suite carries for the blog surface, so its content is deliberately fixed: a
 * typographic regression then shows up as a difference in the rendering rather
 * than in the text.
 */
export const FoundationalBlogPost: Story = {
  render: () => (
    <ThemeProvider defaultLevel="midnight" persist={false} followSystem={false}>
      <LoremIpsumPost />
    </ThemeProvider>
  ),
};
