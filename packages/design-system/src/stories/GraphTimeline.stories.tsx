import type { Meta, StoryObj } from '@storybook/react-vite';
import { GraphTimeline } from '../components/docs/graphs/GraphTimeline';

const meta: Meta<typeof GraphTimeline> = {
  title: 'Docs/GraphTimeline',
  component: GraphTimeline,
  tags: ['autodocs', 'stable'],
  parameters: { docs: { description: { component: 'A compact dated sequence with done, current, and upcoming states. Adapted from [mdxcn](https://github.com/keshav-exe/mdxcn), `registry/default/graph-timeline/graph-timeline.tsx`.' } } },
};

export default meta;
type Story = StoryObj<typeof GraphTimeline>;

/** Bold and italic Markdown identify current and upcoming events. */
export const Default: Story = { render: () => <GraphTimeline title="RELEASE"><ul><li>Mar 16: design</li><li>Mar 17: <strong>build</strong></li><li>Mar 18: <em>ship</em></li></ul></GraphTimeline> };

/** Explicit events make state and labels available to TypeScript callers. */
export const ExplicitEvents: Story = { args: { title: 'INCIDENT', palette: 'multi', events: [{ date: '09:00', label: 'detected', state: 'done' }, { date: '09:12', label: 'mitigating', state: 'now' }, { date: '10:00', label: 'resolved', state: 'next' }] } };

/** The timeline maintains its hierarchy on the light sketch level. */
export const SketchTheme: Story = { render: () => <GraphTimeline title="SKETCH"><ul><li>Mon: <strong>now</strong></li><li>Tue: <em>next</em></li></ul></GraphTimeline>, globals: { level: 'sketch' } };

