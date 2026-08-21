import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from './DropdownMenu';

describe('DropdownMenu', () => {
  it('renders trigger button and content structure', () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>[ ACTIONS ]</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>CLUSTER MENU</DropdownMenuLabel>
          <DropdownMenuItem>
            DEPLOY
            <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="danger">PURGE</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(screen.getByText('[ ACTIONS ]')).toBeDefined();
    expect(screen.getByText('[ CLUSTER MENU ]')).toBeDefined();
    expect(screen.getByText('DEPLOY')).toBeDefined();
    expect(screen.getByText('⌘D')).toBeDefined();
    expect(screen.getByText('PURGE')).toBeDefined();
  });

  it('addresses semantic roles and emits no forbidden color literals', () => {
    const FORBIDDEN =
      /brutalist-|--color-white|--border-color|zinc-|-red-\d|bg-black|text-white|border-white/;

    const { container } = render(
      <DropdownMenu open>
        <DropdownMenuTrigger>[ OPTIONS ]</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>SECTION</DropdownMenuLabel>
          <DropdownMenuItem>OPTION 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    for (const node of container.querySelectorAll<HTMLElement>('*')) {
      expect(node.className, `${node.tagName} pins a palette entry`).not.toMatch(
        FORBIDDEN,
      );
    }
  });
});
