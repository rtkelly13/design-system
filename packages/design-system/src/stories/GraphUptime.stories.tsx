import type { Meta, StoryObj } from '@storybook/react-vite';
import { GraphUptime } from '../components/docs/graphs/GraphUptime';

const meta: Meta<typeof GraphUptime> = {
  title: 'Docs/GraphUptime',
  component: GraphUptime,
  tags: ['autodocs', 'stable'],
  parameters: { docs: { description: { component: 'A compact uptime strip with a percentage and screen-reader summary. Adapted from [mdxcn](https://github.com/keshav-exe/mdxcn), `registry/default/graph-uptime/graph-uptime.tsx`.' } } },
};

export default meta;
type Story = StoryObj<typeof GraphUptime>;

/** Mixed service states show the compact status vocabulary. */
export const Default: Story = { args: { title: 'API UPTIME', days: 'ok ok ok degraded ok down ok empty ok', from: 'MAR 01', to: 'MAR 09' } };

/** A longer strip wraps into fixed columns and uses the ASCII glyph set. */
export const LongRange: Story = { args: { title: 'WORKER UPTIME', days: ['ok', 'ok', 'degraded', 'ok', 'ok', 'ok', 'down', 'ok', 'ok', 'ok', 'ok', 'ok'], columns: 6, glyphs: 'ascii', palette: 'multi' } };

/** Empty slots are represented without making them count against uptime. */
export const SketchTheme: Story = { args: { title: 'SKETCH', days: 'empty empty ok degraded', columns: 4 }, globals: { level: 'sketch' } };

