# Changelog

Pre-1.0 and moving fast. **Every minor may break.** There are two consumers —
`rtkelly13/blog` and this package's own Storybook — both in the same estate and
migrated in the same change, so compatibility between 0.x versions buys nothing
and is not attempted: no deprecation shims, no alias layers, no staged removals.

Proper release notes start at 1.0. Until then this file records only what a
consumer has to *do*, newest first. The reasoning lives in the pull requests and
in [`docs/adr/`](./docs/adr/).

## Unreleased

The second axis. Geometry and time are declared for the first time; ADRs 0001–0004 are accepted.

- **`Medium`** — `web`, `video`, `graphic`. A unit system and a time base, chosen at build time
  by which artifact is being emitted, where a Level is chosen at runtime. **No token varies on
  both axes.** `src/theme/media.ts`.
- `theme.css` carries exactly one Medium, `web`: `--ds-space-*`, `--ds-type-*`,
  `--ds-leading-*`, `--ds-weight-*`, `--ds-stroke-*`, `--ds-elev-*`, `--ds-radius-*`,
  `--ds-duration-*`, `--ds-ease`, `--ds-layer-*`, `--ds-focus-*`. 274 → 336 properties.
- **Prefixes do not collide across axes.** `--ds-text-*` is ink and `--ds-type-*` is size;
  `--ds-border-*` is colour and `--ds-stroke-*` is width. Renamed before shipping, not after.
- **Radius is a token, not a reset.** `*, *::before, *::after { border-radius: 0 !important }`
  is gone; Tailwind's whole radius scale is redefined to the Medium's value, so `rounded-lg` is
  square without this package touching a consumer's document. Closes #54.
- **The contrast floor is Medium-keyed.** `pnpm check:contrast` defaults to the web floors;
  `--medium=video` enforces the stricter frame ones, which the current palette does **not**
  clear — deliberately, since no video artifact is emitted yet.
- `video` is not the web scaled: its type steps are its own and its motion is whole frames.
  `graphic` has no time base at all.

## 0.6.0

The hue vocabulary is gone from the component API. Nothing addresses a colour by
its appearance any more.

- `LegacyAccent`, `brutalistTokens`, and the `--color-brutalist-*`,
  `--color-black` and `--color-white` compat aliases are **deleted**. 540
  emitted custom properties down to 250.
- `accent` / `variant` props take Roles only: `primary`, `secondary`,
  `tertiary`, `quiet` and the four intents. `cyan` → `primary`,
  `yellow` → `secondary`, `pink` → `tertiary`, `green` → `success`.
- Tailwind utilities: `bg-brutalist-cyan` → `bg-accent-primary`,
  `text-brutalist-pink` → `text-accent-tertiary`,
  `text-brutalist-yellow` → `text-accent-secondary`,
  `text-brutalist-neonGreen` → `text-intent-success`.
- CSS variables: `var(--brutalist-cyan)` → `var(--ds-accent-primary)`. Do not
  keep a hue-named fallback — it will be a dark value applied on a light theme.
- `PageHeaderAccent`, `CardAccent`, `TagAccent` deleted; use `AccentToken`.
- **Added** a glow per role — `--shadow-glow-accent-tertiary` and friends —
  because the compat layer's `glow-cyan` / `glow-pink` / `glow-orange` had no
  role-named equivalent. `shadow-glow-cyan` → `shadow-glow-accent-primary`,
  `shadow-glow-pink` → `shadow-glow-accent-tertiary`,
  `shadow-glow-orange` → `shadow-glow-accent-secondary`. Hard shadows were
  already role-named; the glows being hue-only was a symptom of the layer being
  removed.

## 0.5.0

Two themes, and a colour vocabulary underneath the semantic one.

- `THEME_LEVELS` is `['midnight', 'sketch']`. `dim`, `bright` and `white` are
  gone, and so is `levelsByPolarity`. `dim` → `midnight`;
  `bright` / `white` → `sketch`.
- `palette` and `paletteBright` — ten Hues per theme, gated at 5.5:1. Components
  address Roles; a Hue in component code is a defect.
- `accentHue` / `intentHue` declare which Hue each Role is, and
  `check:contrast` asserts they agree.
- `FIXED_COLOURS` — Level-invariant `black`, `white`, `transparent`.
- Design Tokens Format Module export at `tokens/palette.<level>.tokens.json`,
  OKLCH with an sRGB hex fallback.
- Themes are selected with `[data-theme="…"]`. A consumer applying them as a
  class only will match no theme block at all.
