import { createContext, useContext } from 'react';
import type { SiteNavOrientation } from './SiteNav';

// Where a `SiteNavItem` is being rendered, which decides what it renders as.
//
// A module of its own for the reason `dialogPopupRef.ts` is one: `src/index.ts`
// re-exports `SiteNav.tsx` and `MobileNav.tsx` wholesale, and a context in
// either would be published. Nothing exports this file.
//
// - `orientation` — a row in a header, or a column in a drawer or a footer.
// - `inMenu` — inside a group's `Menu`, where an item is a menu link rather
//   than a list item.
// - `onNavigate` — called after any item is followed. `MobileNav` sets it to
//   close its drawer: under a client-side router a followed link does not
//   unload the page, so without it the drawer would stay open over the page
//   it just navigated to.
interface SiteNavContextValue {
  orientation: SiteNavOrientation;
  inMenu: boolean;
  onNavigate?: () => void;
}

export const SiteNavContext = createContext<SiteNavContextValue>({
  orientation: 'horizontal',
  inMenu: false,
});

export function useSiteNavContext(): SiteNavContextValue {
  return useContext(SiteNavContext);
}
