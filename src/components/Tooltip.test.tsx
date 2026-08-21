import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './Tooltip';

describe('Tooltip', () => {
  it('renders trigger and tooltip content when open', () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>[ HOVER ]</TooltipTrigger>
          <TooltipContent>Detailed hint message</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    expect(screen.getByText('[ HOVER ]')).toBeDefined();
    expect(screen.getByText('Detailed hint message')).toBeDefined();
  });

  it('addresses semantic roles and emits no forbidden color literals', () => {
    const FORBIDDEN =
      /brutalist-|--color-white|--border-color|zinc-|-red-\d|bg-black|text-white|border-white/;

    const { container } = render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>[ HOVER ]</TooltipTrigger>
          <TooltipContent>Hint text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    for (const node of container.querySelectorAll<HTMLElement>('*')) {
      expect(node.className, `${node.tagName} pins a palette entry`).not.toMatch(
        FORBIDDEN,
      );
    }
  });
});
