import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../components/Button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../components/DropdownMenu';

const meta: Meta<typeof DropdownMenu> = {
  title: 'Foundations/DropdownMenu',
  component: DropdownMenu,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  render: () => (
    <div className="p-12 flex items-center justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button bracketed>[ CLUSTER OPTIONS ▼ ]</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>POD CONTROLS</DropdownMenuLabel>
          <DropdownMenuItem>
            DEPLOY REPLICA
            <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            SCALE CLUSTER
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>CONFIGURATION</DropdownMenuLabel>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>ENV SECRETS</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>RELOAD VAULT</DropdownMenuItem>
              <DropdownMenuItem>ROTATE KEYS</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="danger">
            PURGE RUNTIME
            <DropdownMenuShortcut>⇧⌘X</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};

export const WithCheckboxes: Story = {
  render: () => (
    <div className="p-12 flex items-center justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button bracketed>[ VIEW OPTIONS ▼ ]</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>TELEMETRY</DropdownMenuLabel>
          <DropdownMenuCheckboxItem checked={true}>
            STATUS BAR
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={false}>
            MEMORY METRICS
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={true}>
            ACTIVITY FEED
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};
