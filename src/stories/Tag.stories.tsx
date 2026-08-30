import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tag } from '../components/Tag';

const meta: Meta<typeof Tag> = {
  title: 'Foundations/Tag',
  component: Tag,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tag>;

/**
 * The label is slugged: spaces become hyphens and the prefix is added unless the
 * text already carries it, so `"design systems"` renders `#design-systems`.
 * Pass the human phrase and let the component form the token.
 */
export const Default: Story = {
  args: { text: 'typescript' },
};

/** With `href` the tag renders as an anchor rather than a span. */
export const AsLink: Story = {
  args: { text: 'design-systems', href: '#design-systems' },
};

/**
 * `prefix` replaces the `#`. Useful for a different namespace — `@` for a
 * version, `~` for an author — but keep one prefix per meaning, because the
 * glyph is the only thing distinguishing two tag vocabularies side by side.
 */
export const CustomPrefix: Story = {
  args: { text: 'v0.1.3', prefix: '@', accent: 'info' },
};

/**
 * A row of tags, which is how they almost always appear. The accents here are
 * *emphasis* — react first, archived last — and that is the correct use. Status
 * belongs in a `Badge`: a `#failed` tag invites the reader to click through to
 * everything else that failed.
 */
export const Row: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Tag text="react" accent="primary" />
      <Tag text="storybook" accent="secondary" />
      <Tag text="tailwind" accent="tertiary" />
      <Tag text="archived" accent="quiet" />
    </div>
  ),
};
