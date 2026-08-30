import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pagination } from '../components/Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Foundations/Pagination',
  component: Pagination,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Pagination>;

/**
 * First page. `PREV` is disabled rather than hidden, so the control keeps its
 * width as the reader moves through — pages are **1-based**, and passing a
 * zero-based index is what makes `PREV` disable a page early.
 */
export const Default: Story = {
  args: { totalPages: 5, currentPage: 1 },
};

/** Both directions live. The position between them is the only page indicator. */
export const MiddlePage: Story = {
  args: { totalPages: 5, currentPage: 3 },
};

/** Last page, with `NEXT` disabled. There is no wrap-around: an archive has an end. */
export const LastPage: Story = {
  args: { totalPages: 5, currentPage: 5 },
};

/** `getPageHref` renders anchors instead of buttons, for crawlable pagination. */
export const AsLinks: Story = {
  args: {
    totalPages: 4,
    currentPage: 2,
    getPageHref: (page) => `?page=${page}`,
  },
};

/**
 * The button form driven by state, which is the right shape only when the page
 * has no URL — a filtered table, say. Anything addressable should use
 * `getPageHref` instead, so the reader keeps middle-click and a copyable link.
 */
export const Interactive: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    return <Pagination totalPages={6} currentPage={page} onPageChange={setPage} />;
  },
};
