import type { Meta, StoryObj } from '@storybook/react-vite';
import { GraphSlope } from '../components/docs/graphs/GraphSlope';

const meta: Meta<typeof GraphSlope> = {
  title: 'Docs/GraphSlope',
  component: GraphSlope,
  tags: ['autodocs', 'stable'],
  parameters: { docs: { description: { component: 'Before/after comparisons with directional change. Adapted from [mdxcn](https://github.com/keshav-exe/mdxcn), `registry/default/graph-slope/graph-slope.tsx`.' } } },
};

export default meta;
type Story = StoryObj<typeof GraphSlope>;

/** Markdown values preserve units while the accessible row carries the comparison. */
export const Default: Story = { render: () => <GraphSlope title="LATENCY" fromLabel="before" toLabel="after"><ul><li>p95: 160 ms → 142 ms</li><li>p99: 420 ms → 390 ms</li></ul></GraphSlope> };

/** Explicit items avoid parsing when values come from application data. */
export const ExplicitItems: Story = { args: { title: 'TRAFFIC', fromLabel: 'yesterday', toLabel: 'today', palette: 'multi', items: [{ label: 'requests', from: 8200, to: 12400 }, { label: 'errors', from: '2.4%', to: '1.2%' }] } };

/** A neutral comparison has a stable resting state in sketch. */
export const SketchTheme: Story = { render: () => <GraphSlope title="SKETCH" fromLabel="old" toLabel="new"><ul><li>size: 10 → 10</li><li>speed: 4 → 8</li></ul></GraphSlope>, globals: { level: 'sketch' } };

