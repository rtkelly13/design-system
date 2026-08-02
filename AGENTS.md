# AGENTS.md

Foundational brutalist design system for ryankelly.dev and personal web applications (`@rtkelly13/design-system`, published to public npm).

Package manager is **pnpm** (`node >=22`).

---

## 🛑 Repository Conventions & Workflow Policy

1. **Squash Merge Only**: All pull requests must be merged into `main` using **Squash and Merge** exclusively.
2. **Delete Branch on Merge**: Feature branches must be automatically or manually deleted immediately upon merge into `main`.
3. **Linear History**: Maintain a strictly linear history. Rebase feature branches onto `main` before merging; no merge commits allowed.
4. **Publishing (npm, trusted publishing)**:
   - Stable releases publish automatically from pushes to `main` via `publish-package.yml`, using npm **Trusted Publishing** (OIDC) — no tokens anywhere. Bump `package.json` version in the PR; the workflow skips already-published versions.
   - Dev prereleases: comment **`/publish-dev`** on a PR to publish `<version>-dev.<pr>.<sha>` under the `dev` dist-tag (`publish-dev-command.yml` dispatches the trusted workflow on the PR branch). Consumers test with `pnpm add @rtkelly13/design-system@dev`.
   - The Tailwind contract consumers import is **`theme.css`** (`@theme` tokens, `.dark`/`.dim` dark variant, `@source`); `styles.css` layers fonts + global resets on top. There is no JS tailwind preset — do not reintroduce one.
5. **Visual Regression Testing**:
   - Powered by Playwright snapshot testing (`tests/visual.spec.ts`).
   - Runs strictly on **Linux CI** to avoid OS font rendering diffs (`maxDiffPixelRatio: 0.002`).
   - Run manual snapshot updates via GitHub Actions `Update Visual Regression Snapshots` workflow (dispatch it on your branch; it commits regenerated baselines back to that branch — this repo blocks Actions from creating PRs).
6. **Required Checks**:
   - `pnpm typecheck`
   - `pnpm build`
   - `pnpm build-storybook`
   - `pnpm test:visual` (Linux CI)
7. **New Components Need Baselines**: adding a story without a snapshot leaves
   `test:visual` unable to assert it. Add the story first, dispatch
   `Update Visual Regression Snapshots` on the branch to generate baselines, then add
   the corresponding case to `tests/visual.spec.ts`.

---

## 🎨 Design System Principles

- **Zero Border-Radius**: `0px` globally enforced.
- **Hard Offset Shadows**: `shadow-hard-*` utilities (2px, 4px, 6px offset, no blur).
- **Dual-Mode Tokens**: Driven by CSS variables remapped by `.dark`, `.dim`, and `.sketch` root theme classes.
- **Bracketed Display Typography**: Headings render in Space Grotesk enclosed in `[ BRACKETED ]` display type.
- **Semantic Roles Over Hues**: Components address roles, never colours. See below.

---

## 🎯 Semantic Theming

Components must **never** reference `--brutalist-cyan`, `--color-white`, `--border-color`
or the `brutalist-*` Tailwind utilities directly. Those are one palette's mapping of the
system's roles; `.dim` and `.sketch` are others. Address the role instead — the semantic
variables in `theme.css` resolve through the palette, so every mode swap propagates for free.

| Role group | Tokens | Use for |
|---|---|---|
| `--ds-accent-*` | `primary`, `secondary`, `tertiary`, `quiet` | Visual hierarchy — what draws the eye first |
| `--ds-intent-*` | `info`, `success`, `warning`, `danger` | Communicated meaning the reader must act on |
| `--ds-surface-*` | `base`, `raised`, `sunken`, `overlay` | Background elevation |
| `--ds-text-*` | `primary`, `secondary`, `muted`, `inverse` | Text prominence |
| `--ds-border-*` | `strong`, `default`, `subtle` | Rule weight |
| `--ds-font-*` | `display`, `body`, `mono`, `pixel` | Typography roles |

From TypeScript, use `accentVar()`, `surfaceVar()`, `textVar()`, `borderVar()`, or the
`semanticTokens` object from `src/lib/theme.ts`. From Tailwind, use the semantic aliases:
`text-accent-primary`, `bg-surface-raised`, `border-edge-subtle`, `text-intent-danger`.

Accent-style props take an `Emphasis` or an `Intent`. The old palette names
(`'cyan' | 'pink' | 'yellow' | 'green'`) still resolve to identical values so existing
consumers keep compiling, but they are deprecated — do not use them in new code.

---

## 📜 Commands

- `pnpm build`: Bundles ESM, CJS, DTS types, and CSS via `tsup`.
- `pnpm storybook`: Starts interactive Storybook dev server on port `6006`.
- `pnpm build-storybook`: Compiles static Storybook documentation site to `storybook-static/`.
- `pnpm test:visual`: Runs Playwright visual regression suite against Storybook stories.
- `pnpm test:visual:update`: Updates Playwright visual snapshots.
- `pnpm typecheck`: Validates TypeScript strict mode.


## 🛑 Repository Conventions & Workflow Policy

1. **Squash Merge Only**: All pull requests must be merged into `main` using **Squash and Merge** exclusively.
2. **Delete Branch on Merge**: Feature branches must be automatically deleted immediately upon merge into `main`.
3. **Linear History**: Maintain a strictly linear history. Rebase feature branches onto `main` before merging; no merge commits allowed.
4. **Direct Push Protection**: Non-force direct pushes to `main` are blocked; PR mechanism required (force pushes permitted when needed).
5. **Local Temp & Worktree Directory**: All temporary files, local databases, scratch files, and git worktrees MUST go inside the root `/temp/` directory (gitignored).
6. **Gitignored Local TODO File**: A root `TODO.md` file MUST exist for local task tracking and be gitignored.
