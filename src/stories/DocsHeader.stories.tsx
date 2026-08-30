import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { BookOpen } from 'lucide-react';
import { DocsHeader } from '../components/docs/DocsHeader';

const nav = [
  { label: 'Docs', href: '/docs', active: true },
  { label: 'Components', href: '/docs/components' },
  { label: 'GitHub', href: 'https://github.com/rtkelly13/design-system', external: true },
];

const meta: Meta<typeof DocsHeader> = {
  title: 'Docs/DocsHeader',
  component: DocsHeader,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof DocsHeader>;

/**
 * Title plus nav, which is the minimum a docs site needs. `active` on a nav
 * item is the caller's to set — the header does no route matching, so a host
 * router decides what "current" means.
 */
export const Default: Story = {
  args: { title: 'Design System', nav },
};

/**
 * `icon` takes a component, not an element — any lucide icon, or anything
 * accepting `className`. It renders beside the title as part of the brand lockup
 * rather than as a separate control.
 */
export const WithIcon: Story = {
  args: { title: 'Design System', nav, icon: BookOpen },
};

/** Omitting `onSearch` hides the search button entirely. */
export const WithSearch: Story = {
  args: { title: 'Design System', nav, onSearch: () => {}, searchShortcut: '⌘K' },
};

/**
 * Everything optional omitted. Worth seeing because it is what a
 * partially-wired header degrades to: no nav, no search, no sidebar toggle —
 * each of those appears only when its prop is supplied, so a missing
 * `onToggleSidebar` silently removes the only way to open the mobile drawer.
 */
export const BrandOnly: Story = {
  args: { title: 'Design System' },
};
