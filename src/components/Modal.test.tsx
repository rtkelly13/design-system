import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from './Modal';

describe('Modal', () => {
  it('portals an open dialog and exposes its accessible name', async () => {
    render(
      <main data-testid="page">
        <Modal isOpen onClose={vi.fn()} title="Settings">
          <p>Preferences</p>
        </Modal>
      </main>,
    );

    const dialog = await screen.findByRole('dialog', { name: '[ Settings ]' });

    expect(dialog.parentElement?.getAttribute('data-slot')).toBe('modal-backdrop');
    expect(screen.getByTestId('page').contains(dialog)).toBe(false);
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('sends focus into the dialog on open, closes on Escape, and restores focus to the opener', async () => {
    const onClose = vi.fn();
    const modal = (isOpen: boolean) => (
      <>
        <button type="button">Open settings</button>
        <Modal isOpen={isOpen} onClose={onClose} title="Settings">
          Content
        </Modal>
      </>
    );

    const { rerender } = render(modal(false));

    const opener = screen.getByRole('button', { name: 'Open settings' });
    opener.focus();

    rerender(modal(true));

    const dialog = await screen.findByRole('dialog');
    expect(document.activeElement).toBe(dialog);

    fireEvent.keyDown(dialog, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledOnce();

    rerender(modal(false));
    expect(document.activeElement).toBe(opener);
  });

  it('locks body scrolling while open and restores the previous value on close', async () => {
    document.body.style.overflow = 'auto';
    const { rerender } = render(
      <Modal isOpen onClose={vi.fn()} title="Settings">
        Content
      </Modal>,
    );

    await screen.findByRole('dialog');
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Modal isOpen={false} onClose={vi.fn()} title="Settings">
        Content
      </Modal>,
    );

    await waitFor(() => expect(document.body.style.overflow).toBe('auto'));
  });

  it('closes when the backdrop itself is clicked, but not when the dialog is clicked', async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Settings">
        Content
      </Modal>,
    );

    const dialog = await screen.findByRole('dialog');
    const backdrop = dialog.parentElement as HTMLElement;

    fireEvent.mouseDown(dialog);
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.mouseDown(backdrop);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
