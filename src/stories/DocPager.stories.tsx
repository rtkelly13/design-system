import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DocPager } from '../components/docs/DocPager';

const meta: Meta<typeof DocPager> = {
  title: 'Docs/DocPager',
  component: DocPager,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DocPager>;

/**
 * The usual case: a page in the middle of a sequence. The *names* of the
 * adjacent pages are the point — this is not `Pagination`, which counts
 * numbered pages for a list view. A reader moving through docs wants to know
 * what comes next, not that it is page 4.
 */
export const Both: Story = {
  args: {
    prev: { label: 'Semantic theming', href: '/docs/theming' },
    next: { label: 'Composition', href: '/docs/composition' },
  },
};

/** First page: `prev` omitted, and `next` should stay right-aligned. */
export const NextOnly: Story = {
  args: { next: { label: 'Composition', href: '/docs/composition' } },
};

/** Last page. `prev` alone still occupies the left, so the row does not shift. */
export const PrevOnly: Story = {
  args: { prev: { label: 'Semantic theming', href: '/docs/theming' } },
};
