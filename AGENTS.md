# AGENTS.md

Foundational brutalist design system for ryankelly.dev and personal web applications (`@rtkelly13/design-system`, published to public npm).

Package manager is **pnpm** (`node >=22`).

## Commands

Everything is a `pnpm` script; these are the ones whose names do not give them away.

| | |
|---|---|
| `pnpm tokens:build` | regenerate `src/theme.css` from `src/theme/levels.ts` — **required after any colour change** |
| `pnpm tokens:check` | fail if that generated file is stale |
| `pnpm check:contrast` | every role pair on every level, as arithmetic |
| `pnpm check:api` | the built type surface against the committed `api/index.d.ts` |
| `pnpm check:visual-coverage` | every component has an asserted story, or a stated reason |
| `pnpm test:visual` | Playwright snapshots — **Linux only**, see [`docs/visual-regression.md`](./docs/visual-regression.md) |
| `pnpm walkthrough` | screenshot every story on every level, for review rather than assertion |

`pnpm lint` reports colour literals at the site that wrote them. `pnpm check:deps`,
`pnpm check:css` and `pnpm check:fonts` are ratchets with stated budgets.

## The two rules that are not discoverable

Everything else here you can find by reading the code. These two you cannot, and both have
cost real time:

1. **`src/theme.css` is generated.** `src/theme/levels.ts` is the only place a level name or a
   level colour is written. Edit that, run `pnpm tokens:build`, commit both.
2. **Colours are addressed by role, never by hue.** A component says `bg-surface-raised` or
   `text-intent-danger`, not `cyan`. See
   [`docs/adr/0001-hues-declared-below-roles.md`](./docs/adr/0001-hues-declared-below-roles.md)
   for why a hue layer exists anyway, and why components still may not touch it.

## Where things are written down

Load these when the task is in them, not before.

| Topic | |
|---|---|
| Domain vocabulary | [`CONTEXT.md`](./CONTEXT.md) |
| Architectural decisions | [`docs/adr/`](./docs/adr/) |
| Theming — the ladder, semantic roles, selection state | [`docs/theming.md`](./docs/theming.md) |
| What a theme declares, and what it can emit | [`docs/theme-taxonomy.md`](./docs/theme-taxonomy.md) |
| Styling in TSX, and the CSS ratchet | [`docs/styling.md`](./docs/styling.md) |
| Visual regression — determinism contract, operating instructions | [`docs/visual-regression.md`](./docs/visual-regression.md) |
| CI shape, and the screenshot walkthrough | [`docs/ci.md`](./docs/ci.md) |
| Evidence on a PR — design, not yet built | [`docs/evidence-pipeline.md`](./docs/evidence-pipeline.md) |
| Unit tests | [`docs/testing.md`](./docs/testing.md) |
| The published API surface | [`docs/api-surface.md`](./docs/api-surface.md) |
| Dependencies, and the ones held back | [`docs/dependencies.md`](./docs/dependencies.md) |
| Hosted Storybook and its domains | [`docs/hosting.md`](./docs/hosting.md) |
| Workflow conventions, with the incidents behind them | [`docs/workflow.md`](./docs/workflow.md) |
| **Third-party reference material — licensing** | [`docs/reference-material.md`](./docs/reference-material.md) |

Standing analysis, written once and still true:
[`docs/surface-readiness.md`](./docs/surface-readiness.md),
[`docs/evaluation.md`](./docs/evaluation.md) and
[`docs/gap-analysis.md`](./docs/gap-analysis.md).

---

## 🛑 Repository Conventions & Workflow Policy

Rule statements only. The reasoning, and the incidents that produced each one, are in
[`docs/workflow.md`](./docs/workflow.md) — read that before changing any of them.

1. **Squash Merge Only**: all pull requests merge into `main` using **Squash and Merge**.
2. **Delete Branch on Merge**: feature branches are deleted immediately on merge.
3. **Linear History**: rebase onto `main` before merging; no merge commits.
4. **Direct Push Protection**: direct pushes to `main` are blocked; PRs required.
5. **Local Temp & Worktree Directory**: temporary files, local databases, scratch files and git worktrees go in the root `/temp/` directory (gitignored).
6. **Gitignored Local TODO File**: a root `TODO.md` file MUST exist for local task tracking and be gitignored.
7. **Auto-Merge Enabled**: PRs may enable auto-merge (squash).
8. **Pinned Action SHAs**: workflows MUST use 40-character commit SHAs, not mutable tags.
9. **Publishing**: stable releases publish from `main` via npm Trusted Publishing — no tokens. Bump `package.json` in the PR. Comment `/publish-dev` for a prerelease.
10. **Re-baselining Happens In The PR**: comment `/update-snapshots` — say `all` when the change is *meant* to alter rendering, and name the story that forced it.
11. **Required Checks**: branch protection requires the single aggregate check named **`ci`**. That name is content-free and **must stay that way** — `shared-utilities` governance matches on the string.
