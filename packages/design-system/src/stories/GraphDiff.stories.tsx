import type { Meta, StoryObj } from '@storybook/react-vite';
import { GraphDiff } from '../components/docs/graphs/GraphDiff';

const meta: Meta<typeof GraphDiff> = {
  title: 'Docs/GraphDiff',
  component: GraphDiff,
  tags: ['autodocs', 'stable'],
  parameters: { docs: { description: { component: 'A readable additions/removals summary for technical writing. Adapted from [mdxcn](https://github.com/keshav-exe/mdxcn), `registry/default/graph-diff/graph-diff.tsx`.' } } },
};

export default meta;
type Story = StoryObj<typeof GraphDiff>;

/** Markdown signs are promoted to semantic add, remove, and keep rows. */
export const Default: Story = { render: () => <GraphDiff title="BUNDLE"><ul><li>runtime: +12 kb</li><li>legacy: -8 kb</li><li>shared: 4 kb</li><li><strong>total: 8 kb</strong></li></ul></GraphDiff> };

/** Typed rows are appropriate for generated release notes. */
export const ExplicitRows: Story = { args: { title: 'CHANGESET', palette: 'multi', rows: [{ label: 'added', value: '4 files', sign: 'add' }, { label: 'removed', value: '1 file', sign: 'remove' }, { label: 'unchanged', value: '12 files' }], footer: { label: 'total', value: '17 files', sign: 'keep' } } };

/** The same diff remains legible in the sketch level. */
export const SketchTheme: Story = { render: () => <GraphDiff title="SKETCH"><ul><li>added: +3</li><li>removed: -1</li></ul></GraphDiff>, globals: { level: 'sketch' } };

