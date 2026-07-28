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

---

## 🎨 Design System Principles

- **Zero Border-Radius**: `0px` globally enforced.
- **Hard Offset Shadows**: `shadow-hard-*` utilities (2px, 4px, 6px offset, no blur).
- **Dual-Mode Tokens**: Driven by CSS variables remapped by `.dark`, `.dim`, and `.sketch` root theme classes.
- **Bracketed Display Typography**: Headings render in Space Grotesk enclosed in `[ BRACKETED ]` display type.

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
