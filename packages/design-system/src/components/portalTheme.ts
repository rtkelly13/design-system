import { THEME_ATTRIBUTE, useOptionalTheme } from './ThemeProvider';

// The Level for a surface portalled out of its provider's subtree.
//
// Base UI portals a popup to `body`, outside a `<ThemeProvider scoped>`
// wrapper's `[data-theme]`, so its role colours resolved from the document's
// Level rather than the trigger's. Stamping the provider's Level on the portal
// root puts it back under the right `[data-theme]` selector. Under an unscoped
// provider the attribute matches the document's and changes nothing; with no
// provider it is omitted. Not exported from the package.
export function usePortalThemeAttribute(): Record<string, string> {
  const theme = useOptionalTheme();
  return theme ? { [THEME_ATTRIBUTE]: theme.level } : {};
}
