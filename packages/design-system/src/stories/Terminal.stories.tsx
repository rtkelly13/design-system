import type { Meta, StoryObj } from '@storybook/react-vite';
import { Terminal } from '../components/docs/graphs/Terminal';

const meta: Meta<typeof Terminal> = {
  title: 'Docs/Terminal',
  component: Terminal,
  tags: ['autodocs', 'stable'],
  parameters: { docs: { description: { component: 'A keyboard-focusable terminal transcript for technical documentation. Adapted from [mdxcn](https://github.com/keshav-exe/mdxcn), `registry/default/terminal/terminal.tsx`.' } } },
};

export default meta;
type Story = StoryObj<typeof Terminal>;

/** Commands, comments, output, and success lines receive distinct roles. */
export const Default: Story = { args: { title: 'SHELL', children: `$ pnpm test\n# running focused checks\n✓ 483 tests passed\nDone in 4.2s` } };

/** The prompt can match a different shell or local terminal convention. */
export const CustomPrompt: Story = { args: { title: 'ZSH', prompt: '❯', children: `❯ git diff --check\n✓ clean\n` } };

/** Long output remains horizontally scrollable in the sketch level. */
export const SketchTheme: Story = { args: { title: 'SKETCH', children: `$ pnpm build-storybook\nOutput is intentionally preserved on one line for copying.` }, globals: { level: 'sketch' } };

