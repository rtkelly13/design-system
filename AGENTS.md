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
   - Runs strictly on **Linux CI** to avoid OS font rendering diffs. Current tolerance is `maxDiffPixelRatio: 0.05` with `threshold: 0.2` (this file previously claimed `0.002`, which has never been the configured value). That tolerance was only ever exercised against a placeholder image — see the next bullet — so it is probably looser than it needs to be now that baselines are real components; tighten deliberately rather than by accident.
   - **The static build must be served by `vite preview`, not `serve`.** `serve` enables clean URLs by default, which 301s `/iframe.html?id=<story>` to `/iframe` and **drops the query string**. Storybook then has no story to select and renders its "No Preview" placeholder — and because `--update-snapshots` will happily bake that placeholder in as the baseline, the whole suite silently passes while testing nothing. That is exactly what happened up to `0.0.5`: all five baselines were the same error page. `tests/visual.spec.ts` now asserts the story root is non-empty and free of "No Preview" so this cannot recur quietly.
   - Run manual snapshot updates via GitHub Actions `Update Visual Regression Snapshots` workflow (dispatch it on your branch; it commits regenerated baselines back to that branch — this repo blocks Actions from creating PRs).
   - Note that the snapshot workflow pushes as `github-actions[bot]`, and CI runs on bot-authored commits land in **`action_required`** — they need an "Approve and run" click before the PR shows a green check.
6. **Required Checks**:
   - `pnpm typecheck`
   - `pnpm build`
   - `pnpm build-storybook`
   - `pnpm test:visual` (Linux CI)
7. **New Components Need Baselines**: adding a story without a snapshot leaves
   `test:visual` unable to assert it. Add the story first, comment
   **`/update-snapshots`** on the PR to generate baselines, then add the
   corresponding case to `tests/visual.spec.ts`.
8. **Re-baselining Happens In The PR**: any change that legitimately alters
   rendering turns the visual check red. Comment **`/update-snapshots`** on the
   PR — it regenerates on Linux, verifies the suite passes against the new
   baselines, commits them back to the branch, and reports what changed. No
   merge required. `workflow_dispatch` still works for baselining `main`.
   Caveat: the baseline commit is pushed with `GITHUB_TOKEN`, and GitHub does
   not start workflow runs from those pushes, so the PR's own visual check keeps
   its previous result until you re-run it or push again. The verification step
   inside the update run is what tells you the new baselines are good.

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
- `pnpm walkthrough`: Screenshots every story in every theme into `walkthrough-report/`.
- `pnpm walkthrough:show`: Opens that report locally.
- `pnpm typecheck`: Validates TypeScript strict mode.

---

## 📌 Dependencies Held Back on Purpose

Anything here is **pinned below latest for a reason**. Check this list before
"just bumping it", and delete the row if you clear the blocker.

| Package      | Held at  | Latest | Why, and what unblocks it |
| ------------ | -------- | ------ | ------------------------- |
| `typescript` | `^6.0.3` | 7.0.2  | TS 7 breaks `pnpm build` — see below. Also keeps this package aligned with the blog, which consumes it. |

### The TypeScript 7 blocker

TS 7 does two things this repo cannot yet absorb:

1. **`baseUrl` was removed** (`error TS5102`). Our own `tsconfig.json` no longer
   sets it — the `@/*` mapping is tsconfig-relative — but `tsup`'s dts worker
   *injects* `baseUrl` itself, which is why `ignoreDeprecations: "6.0"` is
   currently required just to build on TS 6. Remove that escape hatch only when
   tsup stops injecting it.
2. **`tsup`'s DTS step crashes outright.** `tsup` vendors `rollup-plugin-dts`,
   which reads TS internals that TS 7 removed:

   ```
   TypeError: Cannot read properties of undefined (reading 'useCaseSensitiveFileNames')
       at rollup-plugin-dts.cjs
   ```

   This is upstream, not a config mistake: `rollup-plugin-dts@6.4.1` (latest)
   still declares `typescript: ^4.5 || ^5.0 || ^6.0`. Note the failure is
   **`pnpm build` only** — `pnpm typecheck` passes fine on TS 7, so a green
   typecheck is not evidence the upgrade works. Always run `pnpm build`.

**Unblocked when** `rollup-plugin-dts` supports TS 7, or this package moves off
`tsup` for bundling (`tsdown`, the rolldown-era successor, is the likely
candidate). Because the blog consumes this package, move both repos together.

---

## 📸 Screenshot Walkthrough

`pnpm walkthrough` captures every Storybook story in **every theme**
(`dark`, `dim`, `sketch`) and publishes Playwright's own HTML report to
`walkthrough-report/`. CI attaches it as `storybook-walkthrough-<sha>` on every PR.

Download it, unzip, open `index.html` — it works straight from `file://`, no
server needed. `pnpm walkthrough:show` serves it locally.

It is **not** a gate. It asserts nothing about how things should look; it makes
what they *do* look like reviewable. Visual regression stays in `ci.yml`.

Its real value is cross-theme: a token change that reads fine in `dark` can be
unusable in `sketch`, and a pixel diff against a single-theme baseline will
never surface that.

Two structural choices worth keeping:

- **One test per story, not per story-and-theme.** The report lists tests, so a
  row is a component and opening it shows all three themes together — which is
  the comparison worth making. Splitting by theme triples the rows and scatters
  the images that need comparing.
- **Each theme's capture is wrapped in a `test.step`.** Ungrouped, the
  navigation plumbing contributes ~21 rows to the step list and pushes the
  screenshots below the fold.

Note that `expect()`'s message argument becomes the *step title* in the report,
shown next to a green tick on success. `story-ready.ts` therefore raises its
guidance on catch instead — otherwise every passing run reads as a failure.

### Both suites verify the render first

`tests/story-ready.ts` asserts Storybook actually mounted the story before any
screenshot is taken, by checking the `sb-show-main` / `sb-show-errordisplay` /
`sb-show-nopreview` classes Storybook puts on `<body>`.

This is not optional defensiveness. Storybook always paints *something* — a
"No Preview" panel or a red error overlay — so a screenshot taken after a fixed
delay succeeds whether the story rendered or the entire preview bundle failed
to load. Every baseline in this repo was once a screenshot of the "No Preview"
panel, and the suite passed for as long as it kept being one.

### `serve.json` is load-bearing

`serve` rewrites `/iframe.html` to `/iframe` by default (`cleanUrls`), which
breaks Storybook's asset preloading and yields exactly that empty preview. Both
Playwright configs therefore start it as:

```
npx serve storybook-static -p 6006 --config ../serve.json
```

The path is relative to the **served directory**, not the repo root. Do not drop
the `--config` flag.


## 🛑 Repository Conventions & Workflow Policy

1. **Squash Merge Only**: All pull requests must be merged into `main` using **Squash and Merge** exclusively.
2. **Delete Branch on Merge**: Feature branches must be automatically deleted immediately upon merge into `main`.
3. **Linear History**: Maintain a strictly linear history. Rebase feature branches onto `main` before merging; no merge commits allowed.
4. **Direct Push Protection**: Non-force direct pushes to `main` are blocked; PR mechanism required (force pushes permitted when needed).
5. **Local Temp & Worktree Directory**: All temporary files, local databases, scratch files, and git worktrees MUST go inside the root `/temp/` directory (gitignored).
6. **Gitignored Local TODO File**: A root `TODO.md` file MUST exist for local task tracking and be gitignored.
