# Design system workspace

A pnpm workspace holding two published packages.

| | |
|---|---|
| **[`@rtkelly13/design-system`](./packages/design-system)** | Brutalist React component library — a four-rung theme ladder, semantic role tokens, slide deck and docs chrome, visual-regression tested. [README](./packages/design-system/README.md) |
| **[`@rtkelly13/ds-report`](./packages/ds-report)** | Renders a `.tsx` file to one self-contained HTML report, styled by the design system. [README](./packages/ds-report/README.md) |

```bash
pnpm install
pnpm build        # design system, then the report generator
pnpm test         # both suites
pnpm storybook    # the design system's docs and review surface
```

The generator is a separate package because it needs esbuild, Tailwind's compiler
and a TypeScript compiler to do its job — none of which belongs in the dependency
graph of an app that installs the design system for its components.

Agent guidance is in [AGENTS.md](./AGENTS.md), which points at the per-package
files. Both are the source of truth for their package; there is no separate
Claude-specific guidance.
