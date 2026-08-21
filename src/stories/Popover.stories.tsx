import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../components/Button';
import { Popover, PopoverContent, PopoverTrigger } from '../components/Popover';

const meta: Meta<typeof Popover> = {
  title: 'Foundations/Popover',
  component: Popover,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <div className="p-12 flex items-center justify-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button bracketed>[ INSPECT NODE ]</Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="space-y-2">
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-content-primary">
              [ NODE: US-EAST-01 ]
            </h4>
            <div className="space-y-1 font-mono text-xs text-content-muted">
              <div>&gt; STATUS: OPERATIONAL</div>
              <div>&gt; CPU LOAD: 14.2%</div>
              <div>&gt; MEMORY: 1.8GB / 8GB</div>
              <div>&gt; UPTIME: 42d 18h</div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ),
};
