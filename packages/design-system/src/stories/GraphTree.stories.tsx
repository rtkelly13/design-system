import type { Meta, StoryObj } from '@storybook/react-vite';
import { GraphTree } from '../components/docs/graphs/GraphTree';

const meta: Meta<typeof GraphTree> = {
  title: 'Docs/GraphTree',
  component: GraphTree,
  tags: ['autodocs', 'stable'],
  parameters: { docs: { description: { component: 'A compact nested tree for files, modules, and systems. Adapted from [mdxcn](https://github.com/keshav-exe/mdxcn), `registry/default/graph-tree/graph-tree.tsx`.' } } },
};

export default meta;
type Story = StoryObj<typeof GraphTree>;

/** Nested Markdown lists are rendered as a readable file tree. */
export const Default: Story = { render: () => <GraphTree title="FILES"><ul><li><strong>src</strong><ul><li>GraphFlow.tsx — 8 KB</li><li>GraphTree.tsx — 7 KB</li></ul></li></ul></GraphTree> };

/** Typed nodes are useful for generated trees with metadata. */
export const ExplicitNodes: Story = { args: { title: 'MODULES', nodes: [{ label: 'platform', children: [{ label: 'api', meta: 'stable', accent: true }, { label: 'worker', meta: 'preview' }] }] } };

/** The tree keeps its branch structure against the sketch surface. */
export const SketchTheme: Story = { args: { title: 'SKETCH', nodes: [{ label: 'docs', children: [{ label: 'index.mdx' }] }] }, globals: { level: 'sketch' } };

