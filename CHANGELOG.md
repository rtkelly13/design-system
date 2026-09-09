# Changelog

Notable changes to `@rtkelly13/design-system`. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning is
[semver](https://semver.org/spec/v2.0.0.html), with the caveat every `0.x` carries — a minor
may break.

This file starts at `0.5.0`. Earlier releases are in the git history and in the pull requests
they landed through; reconstructing them here would be inventing a record rather than keeping
one.

## [0.5.0] — unreleased

The release that collapses the theme ladder and adds a colour vocabulary underneath the
semantic one. **Breaking.** Migration is at the bottom.

### Removed

- **The `dim`, `bright` and `white` levels.** `THEME_LEVELS` is now
  `['midnight', 'sketch']`. The ladder's four rungs were argued from a sound premise — two
  themes can share a polarity and want different grounds — resting on an assumption that was
  not: that four were used. `levelsByPolarity` had no callers anywhere and
  `SYSTEM_LEVEL` reached only two of the four, so three rungs were paid for and never
  collected. See [`docs/adr/0003`](./docs/adr/0003-two-levels-independently-authored.md).
- **`levelsByPolarity()`.** Zero callers since it was written. At two levels it returns a
  single-element array, which no caller wanted either.
- **The `admin-dashboard-dim` and `saas-landing-dim` visual baselines**, and the `DimMode`
  stories that produced them. With `dim` collapsed into `midnight`, `DimMode` rendered exactly
  what `DarkMode` renders — asserting the same pixels twice under two names.

### Added

- **`palette` and `paletteBright` — a Hue vocabulary.** Ten hues per level, declared *below*
  the Role vocabulary and referenced by it, never derived from it. This is what lets a Target
  with no notion of jobs be emitted at all: a terminal has sixteen positions named by colour
  and no concept of a keyword. Components still address Roles only, and a Hue in component
  code is a defect. See [`docs/adr/0001`](./docs/adr/0001-hues-declared-below-roles.md).
  - Hue angles are measured from 573 commits of authored colour across this repo and
    `rtkelly13/blog`, not chosen — see [`docs/palette-provenance.md`](./docs/palette-provenance.md).
  - Six of the ten dark values are existing brand literals, unchanged. Three were lifted
    because they were failing their floor, by amounts below the threshold at which a
    difference is visible. `violet` is genuinely new: 57 violets were tried across six years
    and none was ever canonical.
- **`FIXED_COLOURS` — `black`, `white`, `transparent`.** Level-invariant, emitted once as
  `--ds-fixed-*`. Use these when true black or true white is meant. `--color-black` and
  `--color-white` are *not* these: they are deprecated compat aliases tracking `surface.base`
  and `text.primary`, so `--color-black` resolved to `#ffffff` on the old `white` level.
- **`Hue`, `AnsiHue`, `FixedColour`, `PALETTE_HUES`** on the public surface.
- **A Design Tokens Format Module export.** `tokens/palette.<level>.tokens.json`, DTCG
  2025.10, one file per level with identical token paths — the conventional answer, since the
  spec deliberately says nothing about themes. Values are OKLCH with an sRGB `hex` fallback,
  so the hue angle survives as a first-class number. Installable directly:
  `@rtkelly13/design-system/tokens/midnight.tokens.json`.
- **`pnpm tokens:design` / `tokens:design:check`.** The second fails on a stale *or orphaned*
  token file, because writing without pruning left files for deleted levels on disk while
  `--check` passed and `exports` kept shipping them.
- **[`DESIGN.md`](./DESIGN.md)** — the portable brand outline, for a person or an agent
  arriving with no context.

### Changed

- **`check:contrast` audits 220 pairs**, and now covers `palette` at a **5.5:1** floor rather
  than WCAG AA's 4.5:1, with `paletteBright` at 4.5:1. Above AA on purpose: an editor draws
  selection, diff and find-match backgrounds *behind* the same tokens, and a palette solved to
  exactly 4.5 has no room left to tint the ground. Measured, the light palette has 1 sRGB step
  of headroom at 4.5 and 22 at 5.5, for 6% average chroma.
- **`Separation` is measured in OKLab ΔE, not luma.** Solving a set of hues to the same
  contrast against one ground equalises their luma *by construction* — the measured spread
  across ten hues was 1.000–1.009, so a luma test rated the whole palette identical.
  `CONTEXT.md` and `docs/theme-taxonomy.md` are corrected.
- **`theme.css` emits four distinct variants** — `midnight:`, `sketch:`, `dark:`, `light:`.
  Both polarity variants survive because neither level is named for its polarity.
- **`sketch`'s accents are solved, not inherited.** All three of the blog's sketch pen colours
  failed WCAG AA against a warm sunken ground: red at 4.03:1, green 4.18:1, blue 4.31:1.
  `border.subtle` also moved, from `#d8d3c4` to `#c8c3b4`, which was 1.25:1 against a
  pure-white `raised`.
- **`accentHue` and `intentHue` — the declared Role → Hue lookup.** ADR 0001 requires the
  direction to be declared rather than inferred, and this is it. `auditHueAgreement` asserts
  each Role holds its declared Hue's value, and that a Role declared `'neutral'` measurably
  *is* one rather than being skipped. Wired into `check:contrast`, so it fails CI. The DTCG
  export now emits real aliases — `"$value": "{palette.cyan}"` — read from the map rather than
  guessed by matching hex, which is the option the ADR rejects as ambiguous when two Roles
  share a value.
- **`Polarity` stays a declared field**, which reverses what #116 predicted. That reasoning
  holds only if the levels are *named* for their polarities; `midnight` and `sketch` are not,
  so `SYSTEM_LEVEL` still maps two media states onto two names that are neither of them.

### Fixed

- **`midnight`'s `accent.tertiary` and `intent.danger` were a second pink.** They held
  `#ec4899` while `palette.pink` held `#f955a4` — two values for one colour in one level,
  0.036 apart in OKLab and therefore invisible. Both cleared their own floor (5.12:1 against a
  4.5 Role floor; 5.90:1 against a 5.5 Hue floor), so neither gate caught it and no screenshot
  could. Exactly the silent drift ADR 0001 rejects its *"both, independently declared"* option
  over. Both Roles now hold the Hue's value.
- **`playwright install-deps` no longer fails on a third-party apt index.** GitHub's Ubuntu
  images ship a Google Chrome apt source that Playwright does not use; a corrupt index on it
  failed the required check even though apt reported having ignored it. Vendor source lists are
  removed before `install-deps` runs.

### Known

- **The visual gate does not catch small colour changes.** `maxDiffPixels: 0` bounds how many
  pixels may count as different; `threshold` stays at Playwright's default `0.2` and decides
  whether a pixel counts at all. The `#ec4899` → `#f955a4` fix above scores 0.0023 in YIQ and
  moved no baseline. Found by probing, tracked in #125, and the reason `auditHueAgreement`
  exists as arithmetic rather than a screenshot.

### Migration

```diff
- import { levelsByPolarity } from '@rtkelly13/design-system';
+ // gone — filter THEME_LEVELS on LEVELS[level].polarity if you need this

- <ThemeProvider defaultLevel="dim">
+ <ThemeProvider defaultLevel="midnight">

- <ThemeProvider defaultLevel="bright">   // or "white"
+ <ThemeProvider defaultLevel="sketch">

- [data-theme="dim"] { … }
+ [data-theme="midnight"] { … }

- [data-theme="bright"], [data-theme="white"] { … }
+ [data-theme="sketch"] { … }
```

`dark:` and `light:` variants are unchanged in meaning. `midnight:` replaces `dim:`; `sketch:`
replaces `bright:` and `white:`.

**`sketch` is deliberately the name `rtkelly13/blog` already uses** for its light theme, so the
thirteen hand-tuned `.sketch` prose and component rules there keep their selector.
