import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CodeBlock } from '../components/docs/CodeBlock';

const meta: Meta<typeof CodeBlock> = {
  title: 'Docs/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CodeBlock>;

/**
 * The bare block. The copy control is always in the DOM and revealed on
 * hover or focus rather than mounted on hover — a button that only exists while
 * the pointer is over it cannot be reached by keyboard at all.
 */
export const Default: Story = {
  args: {
    children: `import { Badge } from '@rtkelly13/design-system';

<Badge accent="success">HEALTHY</Badge>`,
  },
};

/**
 * `title` and `language` add the header bar. Use `title` for the file a snippet
 * comes from: a reader who cannot tell where to paste something has to guess,
 * and the guess is usually wrong.
 */
export const WithTitleAndLanguage: Story = {
  args: {
    title: '.storybook/main.ts',
    language: 'ts',
    children: `const config: StorybookConfig = {
  addons: ['@storybook/addon-docs'],
  refs: REFS,
};`,
  },
};

/** Output samples are not worth copying, so the affordance can be turned off. */
export const NotCopyable: Story = {
  args: {
    title: 'terminal',
    copyable: false,
    children: `Resources:
    + 1 created
    13 unchanged`,
  },
};
