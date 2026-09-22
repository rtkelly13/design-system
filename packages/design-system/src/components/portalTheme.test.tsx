import { act, render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AlertDialog } from './AlertDialog';
import { Button } from './Button';
import { Drawer } from './Drawer';
import { Menu, MenuItem } from './Menu';
import { Modal } from './Modal';
import { Popover } from './Popover';
import { ThemeProvider } from './ThemeProvider';
import { ToastProvider, useToast } from './Toast';
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
    [
      'Modal',
      <Modal key="mo" isOpen onClose={vi.fn()} title="Settings">
        Modal body
      </Modal>,
      'Modal body',
    ],
    [
      'AlertDialog',
      <AlertDialog
        key="a"
        isOpen
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete domain"
        confirmLabel="DELETE"
      >
        Alert body
      </AlertDialog>,
      'Alert body',
    ],
    [
      'Drawer',
      <Drawer key="d" isOpen onClose={vi.fn()} title="Navigation">
        Drawer body
      </Drawer>,
      'Drawer body',
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

  it('Toast resolves its colours from the scoped provider, not the document', async () => {
    document.documentElement.setAttribute('data-theme', 'midnight');
    function Show() {
      const toast = useToast();
      useEffect(() => {
        toast.show({ title: 'Toast body', timeout: 0 });
      }, [toast]);
      return null;
    }
    render(
      <ThemeProvider scoped defaultLevel="sketch">
        <ToastProvider>
          <Show />
        </ToastProvider>
      </ThemeProvider>,
    );
    await act(async () => {});
    await waitFor(() => expect(screen.getAllByText('Toast body').length).toBeGreaterThan(0));
    const visible = screen.getAllByText('Toast body')[0]!;
    expect(visible.closest('[data-theme]')?.getAttribute('data-theme')).toBe('sketch');
  });
});
