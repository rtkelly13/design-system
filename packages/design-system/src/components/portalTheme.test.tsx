import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Button } from './Button';
import { Menu, MenuItem } from './Menu';
import { Popover } from './Popover';
import { ThemeProvider } from './ThemeProvider';
import { Tooltip } from './Tooltip';

// A scoped subtree on a different Level from the document. Base UI portals each
// popup to `body`, outside the scoped wrapper, so without the portal carrying
// the Level its role colours would resolve from the document's instead.
describe('portalled overlays keep a scoped Level', () => {
  afterEach(() => document.documentElement.removeAttribute('data-theme'));

  const levelOf = (text: string) => screen.getByText(text).closest('[data-theme]')?.getAttribute('data-theme');

  it.each([
    [
      'Tooltip',
      <Tooltip key="t" content="Tip text" defaultOpen>
        <Button aria-label="Info">i</Button>
      </Tooltip>,
      'Tip text',
    ],
    [
      'Popover',
      <Popover key="p" defaultOpen title="Build" trigger={<Button>DETAILS</Button>}>
        Popover body
      </Popover>,
      'Popover body',
    ],
    [
      'Menu',
      <Menu key="m" defaultOpen trigger={<Button>ACTIONS</Button>}>
        <MenuItem>Rename</MenuItem>
      </Menu>,
      'Rename',
    ],
  ])('%s resolves its colours from the scoped provider, not the document', async (_, ui, text) => {
    document.documentElement.setAttribute('data-theme', 'midnight');
    render(
      <ThemeProvider scoped defaultLevel="sketch">
        {ui}
      </ThemeProvider>,
    );
    await waitFor(() => expect(screen.getByText(text)).toBeDefined());
    expect(levelOf(text)).toBe('sketch');
  });
});
