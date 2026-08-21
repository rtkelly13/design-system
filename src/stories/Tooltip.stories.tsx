import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../components/Button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'Foundations/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <div className="p-12 flex items-center justify-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button bracketed>[ HOVER ME ]</Button>
          </TooltipTrigger>
          <TooltipContent>
            <span>&gt; Telemetry sensor ping: 12ms</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  ),
};
