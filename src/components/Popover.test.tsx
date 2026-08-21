import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';

describe('Popover', () => {
  it('renders trigger and popover content when open', () => {
    render(
      <Popover open>
        <PopoverTrigger>[ INSPECT ]</PopoverTrigger>
        <PopoverContent>
          <p>Node status: Active</p>
        </PopoverContent>
      </Popover>,
    );

    expect(screen.getByText('[ INSPECT ]')).toBeDefined();
    expect(screen.getByText('Node status: Active')).toBeDefined();
  });

  it('addresses semantic roles and emits no forbidden color literals', () => {
    const FORBIDDEN =
      /brutalist-|--color-white|--border-color|zinc-|-red-\d|bg-black|text-white|border-white/;

    const { container } = render(
      <Popover open>
        <PopoverTrigger>[ TRIGGER ]</PopoverTrigger>
        <PopoverContent>
          <span>Content</span>
        </PopoverContent>
      </Popover>,
    );

    for (const node of container.querySelectorAll<HTMLElement>('*')) {
      expect(node.className, `${node.tagName} pins a palette entry`).not.toMatch(
        FORBIDDEN,
      );
    }
  });
});
