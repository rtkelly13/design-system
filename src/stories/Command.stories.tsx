import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../components/Button';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '../components/Command';

const meta: Meta<typeof Command> = {
  title: 'Foundations/Command',
  component: Command,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Command>;

export const Embedded: Story = {
  render: () => (
    <div className="p-8 max-w-xl mx-auto">
      <Command className="border-2 border-edge-strong shadow-hard-md">
        <CommandInput placeholder="Search system commands..." />
        <CommandList>
          <CommandEmpty>No matching commands found.</CommandEmpty>
          <CommandGroup heading="QUICK ACTIONS">
            <CommandItem>
              <span>DEPLOY APPLICATION</span>
              <CommandShortcut>⌘D</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <span>SYNC VAULT SECRETS</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="NAVIGATION">
            <CommandItem>
              <span>GOTO DASHBOARD</span>
              <CommandShortcut>G D</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <span>GOTO REPOSITORIES</span>
              <CommandShortcut>G R</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  ),
};

export const DialogMode: Story = {
  render: () => {
    function CommandDialogExample() {
      const [isOpen, setIsOpen] = useState(false);

      return (
        <div className="p-12 flex flex-col items-center gap-4">
          <Button bracketed onClick={() => setIsOpen(true)}>
            [ OPEN COMMAND PALETTE (⌘K) ]
          </Button>
          <CommandDialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No matching commands found.</CommandEmpty>
              <CommandGroup heading="DEPLOYMENT">
                <CommandItem onSelect={() => setIsOpen(false)}>
                  <span>PROMOTE STAGING TO PRODUCTION</span>
                  <CommandShortcut>⇧⌘P</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => setIsOpen(false)}>
                  <span>ROLLBACK PREVIOUS BUILD</span>
                  <CommandShortcut>⇧⌘R</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </CommandDialog>
        </div>
      );
    }

    return <CommandDialogExample />;
  },
};
