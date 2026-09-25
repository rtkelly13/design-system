import type { Meta, StoryObj } from '@storybook/react-vite';
import { Graph } from '../components/docs/graphs/GraphFrame';

const meta: Meta<typeof Graph> = {
  title: 'Docs/GraphFrame',
  component: Graph,
  tags: ['autodocs', 'stable'],
  parameters: { docs: { description: { component: 'The shared accessible frame for the mdxcn-inspired docs graph family. Adapted from [mdxcn](https://github.com/keshav-exe/mdxcn), specifically `registry/default/graph-frame/graph-frame.tsx`.' } } },
};

export default meta;
type Story = StoryObj<typeof Graph>;

/** The base frame supplies the caption, corners, and figure landmark. */
export const Default: Story = { args: { title: 'FRAME', children: <p className="p-8">Content lives inside the shared frame.</p> } };

/** A custom corner makes the frame useful for distinct editorial surfaces. */
export const CustomCorner: Story = { args: { title: 'CORNER', corner: '·', children: <p className="p-8">Corners are intentionally small and quiet.</p> } };

/** The frame remains the same contract in the light sketch level. */
export const SketchTheme: Story = { args: { title: 'SKETCH', children: <p className="p-8">Semantic tokens change with the selected theme.</p> }, globals: { level: 'sketch' } };

