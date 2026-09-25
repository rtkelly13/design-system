import type { Meta, StoryObj } from '@storybook/react-vite';
import { GraphFlow } from '../components/docs/graphs/GraphFlow';

const meta: Meta<typeof GraphFlow> = {
  title: 'Docs/GraphFlow',
  component: GraphFlow,
  tags: ['autodocs', 'stable'],
  parameters: { docs: { description: { component: 'MDX-friendly paths connected by ASCII arrows. Adapted from [mdxcn](https://github.com/keshav-exe/mdxcn), `registry/default/graph-flow/graph-flow.tsx`.' } } },
};

export default meta;
type Story = StoryObj<typeof GraphFlow>;

/** Markdown children are split into readable left-to-right paths. */
export const Default: Story = { render: () => <GraphFlow title="PUBLISH"><ul><li>write → review → <strong>ship</strong></li><li>measure → improve</li></ul></GraphFlow> };

/** The data form is useful when graph values arrive from a typed source. */
export const ExplicitRows: Story = { args: { title: 'PIPELINE', palette: 'multi', rows: [{ nodes: [{ label: 'ingest' }, { label: 'transform', tone: 'accent' }, { label: 'publish' }] }] } };

/** Sketch is a first-class theme rather than a separate colour implementation. */
export const SketchTheme: Story = { render: () => <GraphFlow title="SKETCH" palette="duo"><ul><li>draft → <strong>review</strong> → ship</li></ul></GraphFlow>, globals: { level: 'sketch' } };

