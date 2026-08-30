import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageTitle } from '../components/PageTitle';

const meta: Meta<typeof PageTitle> = {
  title: 'Foundations/PageTitle',
  component: PageTitle,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PageTitle>;

/**
 * The title alone. `bracketed` defaults to on, so this is already the house
 * voice without the prop being written — the `Bracketed` story below exists to
 * show the prop, not a different default.
 */
export const Default: Story = {
  args: { children: 'Nested theme panels' },
};

/**
 * `subtitle` renders outside the `<h1>`, in mono and the primary accent. That
 * placement is the point: a subtitle inside the heading would join the document
 * outline and show up in every table of contents built from it.
 */
export const WithSubtitle: Story = {
  args: {
    children: 'Nested theme panels',
    subtitle: 'Why var() substitution decides where a theme stops applying',
  },
};

/**
 * Bracketing made explicit. Turn it *off* — `bracketed={false}` — when the
 * title is a proper noun or a domain, where brackets read as a placeholder
 * someone forgot to fill in.
 */
export const Bracketed: Story = {
  args: { children: 'Release notes', bracketed: true },
};
