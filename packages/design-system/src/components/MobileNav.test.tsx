import { createRef, useState } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LinkProvider } from './LinkProvider';
import { MobileNav } from './MobileNav';
import { SiteNavItem } from './SiteNav';
import { ThemeProvider } from './ThemeProvider';

function Items() {
  return (
    <>
      <SiteNavItem href="#work">Work</SiteNavItem>
      <SiteNavItem href="#writing">Writing</SiteNavItem>
    </>
  );
}

describe('MobileNav', () => {
  afterEach(() => document.documentElement.removeAttribute('data-theme'));

  it('starts closed: a trigger that says what it opens and that it is collapsed', () => {
    render(
      <MobileNav label="Primary">
        <Items />
      </MobileNav>,
    );
    const trigger = screen.getByRole('button', { name: 'MENU' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens a left Drawer holding a named, vertical navigation landmark', async () => {
    render(
      <MobileNav label="Primary">
        <Items />
      </MobileNav>,
    );
    const trigger = screen.getByRole('button', { name: 'MENU' });
    fireEvent.click(trigger);

    const drawer = await screen.findByRole('dialog', { name: '[ Menu ]' });
    expect(drawer.getAttribute('data-slot')).toBe('drawer');
    expect(drawer.getAttribute('data-placement')).toBe('left');
    const nav = within(drawer).getByRole('navigation', { name: 'Primary' });
    expect(nav.getAttribute('data-orientation')).toBe('vertical');
    expect(within(nav).getAllByRole('link').map((l) => l.textContent)).toEqual(['Work', 'Writing']);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('closes when an item is followed, because a routed page does not unload', async () => {
    const onOpenChange = vi.fn();
    render(
      <MobileNav label="Primary" defaultOpen onOpenChange={onOpenChange}>
        <Items />
      </MobileNav>,
    );
    const drawer = await screen.findByRole('dialog');
    fireEvent.click(within(drawer).getByRole('link', { name: 'Writing' }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('shares the Drawer dismissal: Escape closes it and focus returns to the trigger', async () => {
    render(
      <MobileNav label="Primary">
        <Items />
      </MobileNav>,
    );
    const trigger = screen.getByRole('button', { name: 'MENU' });
    trigger.focus();
    fireEvent.click(trigger);
    const drawer = await screen.findByRole('dialog');
    await waitFor(() => expect(drawer.contains(document.activeElement)).toBe(true));

    fireEvent.keyDown(document.activeElement ?? drawer, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it('is controllable: it reports, and the owner decides', async () => {
    function Controlled() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <span data-testid="state">{String(open)}</span>
          <MobileNav label="Primary" open={open} onOpenChange={setOpen}>
            <Items />
          </MobileNav>
        </>
      );
    }
    render(<Controlled />);
    const drawer = await screen.findByRole('dialog');
    fireEvent.click(within(drawer).getByRole('button', { name: 'Close drawer' }));
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('false'));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('stays open when controlled and the owner ignores the request', async () => {
    const onOpenChange = vi.fn();
    render(
      <MobileNav label="Primary" open onOpenChange={onOpenChange}>
        <Items />
      </MobileNav>,
    );
    const drawer = await screen.findByRole('dialog');
    fireEvent.click(within(drawer).getByRole('link', { name: 'Work' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole('dialog')).toBeDefined();
  });

  it('uses the consumer route for the current item inside the drawer', async () => {
    render(
      <LinkProvider isCurrent={(href) => href === '/writing'}>
        <MobileNav label="Primary" defaultOpen>
          <SiteNavItem href="/work">Work</SiteNavItem>
          <SiteNavItem href="/writing">Writing</SiteNavItem>
        </MobileNav>
      </LinkProvider>,
    );
    const drawer = await screen.findByRole('dialog');
    expect(within(drawer).getByRole('link', { name: 'Writing' }).getAttribute('aria-current')).toBe('page');
    expect(within(drawer).getByRole('link', { name: 'Work' }).hasAttribute('aria-current')).toBe(false);
  });

  it('names the drawer and the trigger from its props', async () => {
    render(
      <MobileNav label="Primary" title="Sections" triggerLabel="SECTIONS" defaultOpen>
        <Items />
      </MobileNav>,
    );
    expect(await screen.findByRole('dialog', { name: '[ Sections ]' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'SECTIONS', hidden: true })).toBeDefined();
  });

  it('forwards its ref and its rest props to the drawer panel', async () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <MobileNav ref={ref} label="Primary" defaultOpen data-testid="panel" className="max-w-xs">
        <Items />
      </MobileNav>,
    );
    const drawer = await screen.findByRole('dialog');
    expect(ref.current).toBe(drawer);
    expect(drawer.getAttribute('data-testid')).toBe('panel');
    expect(drawer.className).toContain('max-w-xs');
  });

  // The drawer is portalled to `body`, outside a scoped provider's wrapper.
  // `Drawer` carries the scoped Level across (#281); this holds `MobileNav`
  // to inheriting it rather than rendering a portal of its own that does not.
  it('opens with the scoped Level, not the document one', async () => {
    document.documentElement.setAttribute('data-theme', 'midnight');
    render(
      <ThemeProvider scoped defaultLevel="sketch">
        <MobileNav label="Primary" defaultOpen>
          <Items />
        </MobileNav>
      </ThemeProvider>,
    );
    const drawer = await screen.findByRole('dialog');
    expect(drawer.closest('[data-theme]')?.getAttribute('data-theme')).toBe('sketch');
    const backdrop = document.querySelector('[data-slot="drawer-backdrop"]');
    expect(backdrop?.closest('[data-theme]')?.getAttribute('data-theme')).toBe('sketch');
  });
});
