# Changelog

Notable changes to `@rtkelly13/design-system`.

This file starts at **0.2.0**, the release that renamed every theme level. Both
consumers are still on 0.1.x, so 0.2.0 and 0.3.0 are the two releases anyone
upgrading has to read. Earlier versions predate the changelog; their history is
in the git log.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This package is pre-1.0, so **a minor bump may contain breaking changes** — a
caret range on `0.x` pins the minor, and that is deliberate.

---

## [Unreleased]

### Added

- `LICENSE`. `package.json` claimed MIT and listed the file in `files`; the file
  did not exist, so two releases shipped an MIT claim with no licence text.
- `sideEffects: ["**/*.css"]`, so a bundler knows not to tree-shake the
  stylesheets, and `engines: { node: ">=22" }`.
- `pnpm check:api` — the emitted `dist/index.d.ts` is diffed against
  `api/index.d.ts` on every CI run, so a breaking type change cannot ship
  without a human reading it in a PR diff.
- A general-purpose lint ruleset (`typescript-eslint` recommended,
  `react-hooks`, `jsx-a11y`) alongside the two custom rules.

### Changed

- **`styles.css` no longer squares every element in your document.** The reset
  was `*, *::before, *::after { border-radius: 0 !important }`, which reached
  third-party widgets — date pickers, map controls, embedded players, the host
  element of a payment iframe — with no opt-out short of a more specific
  `!important`. It is now an element-targeted rule over form controls, which is
  the only place a radius arrives on its own. Verified not to change a single
  pixel of this package's own rendering across all 38 visual cases.

  If you were relying on the old reach to square your own or a third party's
  markup, add `border-radius: 0` where you need it.

### Fixed

- **Keyboard focus is visible again on `Input`, `TextArea`, `Select`, `Modal`'s
  close button and `Tag`.** Each carried `focus:outline-none`, which outranks
  the global `:focus-visible` rule and removed the outline on exactly the
  keyboard focus it exists for. The three most-used interactive surfaces in the
  package had no forced-colors-safe focus indicator.
- **`SlideDeck` no longer hijacks the page keyboard.** Its `keydown` handler was
  registered on `window` and called `preventDefault()` on Space, so the space
  bar stopped working in every text field on the page while any deck was
  mounted. It now listens on its own container. `isFullscreen` is read from
  `fullscreenchange` rather than assigned by hand, so leaving fullscreen with
  Esc no longer desyncs it, and the icon-only controls have accessible names.
- **`DocsHeader` no longer throws without a `ThemeProvider`.** It required the
  context, so a consumer theming with the `data-theme` attribute alone — a
  documented deployment shape — lost the whole page rather than one control.
  The level switcher is omitted when there is no provider.
- `Tag` renders a `<button>` when given an `onClick` instead of a `<span>` with
  a click handler, so it takes focus and answers the keyboard.
- The contrast gate now audits `accent.quiet` as a fill. All four levels already
  passed; the gap meant a future edit to that role would have gone unchecked.
- `theme.css` no longer tells consumers to run `pnpm check:tokens`, a script
  that was deleted.

### Removed

- 27 `default` exports. `src/index.ts` uses `export *`, which does not forward
  defaults, and the `exports` map has no deep paths, so none of them were
  reachable from any consumer. The emitted `.d.ts` is byte-identical without
  them.
- Four dead classes — `style-card-wrap`, `docs-toc`, `docs-sidebar`,
  `docs-breadcrumbs`. Each named no rule in any stylesheet. **If your own CSS
  hooks onto one of the `docs-*` names, it was never styled by this package and
  is now gone from the markup.**

---

## [0.3.0]

### Added

- `Modal`, with a real focus trap, scroll lock, focus return and Escape
  handling.
- The documentation portal: `DocsLayout`, `DocsHeader`, `DocsSidebar`,
  `TableOfContents`, `Breadcrumbs`, `DocPager`, `CodeBlock`, `AnchorHeading`,
  `Prose` and the MDX component map.
- A Vitest unit suite over `src/lib` and `src/hooks`, and a test pinning the
  shape the token generator has to emit.
- A story for every component, with one representative per component asserted by
  the visual suite and `pnpm check:visual-coverage` gating that it stays true.
- `pnpm lint` reports a colour written as a literal at the line that wrote it.

### Changed

- **Fonts are self-hosted from `@fontsource` instead of fetched from Google at
  first paint.** This is the breaking one in 0.3.0: `styles.css` now imports the
  font packages, so they resolve from *your* `node_modules` at your build time.
  A correctness choice before a performance one — the previous `@import`
  transmitted every visitor's IP to a third party.
- `Button` renders an `<a>` when given an `href`, so a control that navigates
  keeps middle-click, open-in-new-tab and its announcement as a link.
- `DataTable`, `Pagination`, `PageHeader` and `StatCard` address semantic roles
  rather than palette colours, so they follow the ladder on all four levels.
- The visual suite's tolerance is `maxDiffPixels: 0`, replacing a ratio that let
  real changes through.

### Fixed

- `Modal` was not actually modal.
- The `white` `Button` variant was pinned to a literal `bg-white text-black`, so
  it stayed white on a white page. It now inverts with the level.

---

## [0.2.0]

The four-rung theme ladder, styling in TSX, and three new gates.

### Changed — BREAKING: every theme level was renamed

The pre-0.2.0 ladder was three levels selected by a **class** on the root. It is
now four levels selected by a **`data-theme` attribute**, with the class
mirrored for consumers whose own CSS selects on it.

| Before 0.2.0 | 0.2.0 onwards | Note |
| --- | --- | --- |
| `dark` | `midnight` | Renamed. Still the darkest rung |
| `dim` | `dim` | **Unchanged** |
| `sketch` | `bright` | Renamed |
| — | `white` | **New.** Neutral, print-safe, dense UI |

A clean 1:1 rename with one rung added at the light end. Nothing merged, nothing
split.

**There is deliberately no compatibility alias.** `theme.css` does not emit
`[data-theme="dark"]` or `[data-theme="sketch"]`, and `isThemeLevel()` rejects
both. A selector that matches nothing fails silently, so instead the old names
are *recognised* and reported: reading `dark` or `sketch` from `localStorage` or
from the `data-theme` attribute logs an error naming the replacement, once per
value. `RENAMED_LEVELS` is exported if you want the mapping in your own
migration code — it is a diagnostic table, not a resolution table.

To upgrade, replace the level names wherever you write them. A theme switcher
listing `['dark', 'dim', 'sketch']` becomes
`['midnight', 'dim', 'bright', 'white']`.

### Added

- Semantic role tokens — `--ds-accent-*`, `--ds-intent-*`, `--ds-surface-*`,
  `--ds-text-*`, `--ds-border-*`, `--ds-font-*`. Components address roles, never
  colours, so they remap with the level.
- `pnpm check:contrast`, auditing every role pair on every level.
- `pnpm tokens:check`, failing when the generated `theme.css` drifts from
  `src/theme/levels.ts`.
- `pnpm check:css`, a ratchet on styling that lives in a stylesheet.
- `<ThemeProvider scoped>`, so a `bright` panel inside a `midnight` page
  resolves correctly at any depth.
- `getThemeInitScript()`, which sets the attribute before first paint so SSR
  neither flashes nor mismatches on hydration.

### Changed

- Styling moved out of CSS and onto the elements as Tailwind utilities.
  Composition goes through `recipe` / `cn`, which resolve conflicting utilities
  before the string reaches the DOM — appending a caller's `className` to a
  template string never worked, because Tailwind decides between conflicting
  utilities by CSS source order.
- The Tailwind contract is `theme.css`, generated from `src/theme/levels.ts`.
  There is no JS preset.

[Unreleased]: https://github.com/rtkelly13/design-system/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/rtkelly13/design-system/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/rtkelly13/design-system/compare/v0.1.3...v0.2.0
