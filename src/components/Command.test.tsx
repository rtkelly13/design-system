import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from './Command';

describe('Command', () => {
  it('renders command search prompt and list items', () => {
    render(
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandEmpty>No matching commands.</CommandEmpty>
          <CommandGroup heading="ACTIONS">
            <CommandItem>
              DEPLOY APP
              <CommandShortcut>⌘D</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );

    expect(screen.getByPlaceholderText('Search...')).toBeDefined();
    expect(screen.getByText('[ ACTIONS ]')).toBeDefined();
    expect(screen.getByText('DEPLOY APP')).toBeDefined();
    expect(screen.getByText('⌘D')).toBeDefined();
  });

  it('addresses semantic roles and emits no forbidden color literals', () => {
    const FORBIDDEN =
      /brutalist-|--color-white|--border-color|zinc-|-red-\d|bg-black|text-white|border-white/;

    const { container } = render(
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandGroup heading="ACTIONS">
            <CommandItem>RUN</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );

    for (const node of container.querySelectorAll<HTMLElement>('*')) {
      expect(node.className, `${node.tagName} pins a palette entry`).not.toMatch(
        FORBIDDEN,
      );
    }
  });
});
