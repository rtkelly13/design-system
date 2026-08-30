import { useEffect } from 'react';
import type { ReactNode } from 'react';

export interface DocsLayoutProps {
  /** Rendered above everything, sticky. Normally a `DocsHeader`. */
  header?: ReactNode;
  /** Left rail. Normally a `DocsSidebar`. */
  sidebar?: ReactNode;
  /** Right rail. Normally a `TableOfContents`. Hidden below `xl`. */
  toc?: ReactNode;
  /** The page body — normally a `Prose` scope holding the compiled MDX. */
  children: ReactNode;
  /** Mobile drawer state. Ignored at `lg` and up, where the rail is always shown. */
  sidebarOpen?: boolean;
  /**
   * Called when the mobile drawer asks to close — the scrim, or Escape. Paired
   * with `sidebarOpen`; the layout holds no state of its own.
   */
  onCloseSidebar?: () => void;
  /** Extra classes on the layout's outermost element. */
  className?: string;
}

/**
 * Three-column documentation shell: sidebar, content, contents rail.
 *
 * Below `lg` the sidebar becomes an overlay drawer. Scroll on `<body>` is
 * locked while it is open, otherwise the page behind scrolls under the drawer
 * on touch devices and the reader loses their place on close.
 */
export function DocsLayout({
  header,
  sidebar,
  toc,
  children,
  sidebarOpen = false,
  onCloseSidebar,
  className = '',
}: DocsLayoutProps) {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!sidebarOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen || !onCloseSidebar || typeof window === 'undefined') return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseSidebar();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sidebarOpen, onCloseSidebar]);

  return (
    <div className={`docs-layout ${className}`.trim()}>
      {header}

      <div className="docs-layout-body">
        {sidebar && (
          <>
            {sidebarOpen && (
              <div
                className="docs-layout-scrim"
                onClick={onCloseSidebar}
                aria-hidden="true"
              />
            )}
            <aside
              className="docs-layout-sidebar"
              data-open={sidebarOpen ? 'true' : undefined}
            >
              {sidebar}
            </aside>
          </>
        )}

        <main className="docs-layout-main" id="docs-content">
          {children}
        </main>

        {toc && <aside className="docs-layout-toc">{toc}</aside>}
      </div>
    </div>
  );
}

export default DocsLayout;
