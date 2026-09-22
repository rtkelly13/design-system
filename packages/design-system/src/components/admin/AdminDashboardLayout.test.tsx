import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdminDashboardLayout } from './AdminDashboardLayout';
import { ToastProvider } from '../Toast';

/**
 * The dashboard is `Toast`'s first consumer, and the thing worth pinning is the
 * contract it follows: adapt rather than require. Inside a provider a sync is
 * acknowledged with a toast; without one the button still reports the press
 * and the layout renders exactly as it did.
 */
describe('AdminDashboardLayout — sync notification', () => {
  it('announces a requested sync when a ToastProvider is present', async () => {
    const onTriggerSync = vi.fn();
    render(
      <ToastProvider>
        <AdminDashboardLayout onTriggerSync={onTriggerSync} />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /TRIGGER SYNC/ }));

    expect(onTriggerSync).toHaveBeenCalledTimes(1);
    const region = await screen.findByRole('region', { name: 'Notifications' });
    const toast = await screen.findByRole('dialog', { name: 'SYNC REQUESTED' });
    expect(region.contains(toast)).toBe(true);
    expect(toast.getAttribute('data-intent')).toBe('info');
  });

  it('shows one toast however many times the button is pressed', async () => {
    render(
      <ToastProvider>
        <AdminDashboardLayout />
      </ToastProvider>,
    );

    const button = screen.getByRole('button', { name: /TRIGGER SYNC/ });
    fireEvent.click(button);
    fireEvent.click(button);

    await screen.findByRole('dialog', { name: 'SYNC REQUESTED' });
    expect(screen.getAllByRole('dialog', { name: 'SYNC REQUESTED' })).toHaveLength(1);
  });

  it('still works without a provider', () => {
    const onTriggerSync = vi.fn();
    render(<AdminDashboardLayout onTriggerSync={onTriggerSync} />);

    fireEvent.click(screen.getByRole('button', { name: /TRIGGER SYNC/ }));

    expect(onTriggerSync).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('region', { name: 'Notifications' })).toBeNull();
  });
});
