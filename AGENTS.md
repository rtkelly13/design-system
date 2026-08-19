# AGENTS.md — workspace root

A pnpm workspace with two published packages. Read the one you are working in;
this file only says which that is and what holds between them.

| Package | What it is | Depends on |
|---|---|---|
| [`packages/design-system`](./packages/design-system/AGENTS.md) | `@rtkelly13/design-system` — the brutalist component library, the four-rung theme ladder, and the CSS contract. React and Tailwind, no Node. | react, react-dom, tailwindcss (peers) |
| [`packages/ds-report`](./packages/ds-report/AGENTS.md) | `@rtkelly13/ds-report` — renders a `.tsx` file to one self-contained HTML report. Node-only tooling with a `ds-report` bin. | **the design system** (peer), esbuild, tailwindcss, typescript |

Package manager is **pnpm** (`node >=22`).

---

## 🛑 The dependency runs one way

`ds-report` depends on `design-system`. **The design system must never depend on
the report generator**, and nothing in it may import from that package — stories
and tests included.

This is why the split exists at all. The generator needs esbuild, Tailwind's
compiler and a TypeScript compiler; a React app that installs the design system
for its components should carry none of them. Before the split those three were
in the design system's peer list, and its `exports` map and `bin` advertised a
report generator to every consumer of a component library.

Two consequences worth knowing before working across the line:

- **The report *frame* is design, the report *pipeline* is tooling.**
  `ReportDocument`, `ReportSection` and `ReportDetails` live in the design system
  with a story and a visual baseline. The generator's templates and fixtures live
  with the generator. A story that imported the generator's sample to get a
  richer screenshot would invert the dependency — each package asserts what it
  owns.
- **Neither package uses the `workspace:` protocol.** `npm publish` does not
  rewrite it and the trusted-publishing path goes through npm, so the ranges are
  plain semver; pnpm links the local copy anyway because the workspace version
  satisfies them. `pnpm verify:report-cli` asserts the range still admits the
  design system's actual version, because nothing else would notice it drifting.

---

## 📜 Root commands

These fan out across the workspace. Everything else is per-package.

- `pnpm build`: design system first, then the generator. **That order is the
  workspace's one hard sequencing** — `ds-report` resolves its peer through the
  design system's `exports` map, which points at `dist/`.
- `pnpm typecheck`: both packages, building the design system in between for the
  same reason.
- `pnpm test`: both suites. The design system's is ~5s; the generator's is ~30s,
  because it renders and typechecks for real.
- `pnpm verify:report-cli`: packs both packages and drives the CLI from a real
  install.
- `pnpm contrast:report:html`: builds, then renders
  `packages/design-system/reports/contrast.tsx` — the workspace's own dogfood.
- `pnpm storybook`, `pnpm build-storybook`, `pnpm test:visual`,
  `pnpm check:*`, `pnpm tokens:*`: all filtered to the design system.

---

## 📦 Publishing

Both packages publish from `main` via npm **Trusted Publishing** (OIDC) in
`publish-package.yml`, in dependency order, skipping versions that already exist.
Bump the version in the package's own `package.json` in the PR.

> [!IMPORTANT]
> `@rtkelly13/ds-report` has never been published. Trusted publishing is
> configured per package on npmjs.com and cannot be set up for a package that
> does not exist yet, so its **first** release needs either a manual publish or
> the trusted-publisher entry created first. The design system is already
> configured and unaffected.
