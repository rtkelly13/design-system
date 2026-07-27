# 🎨 @rtkelly13/design-system

The foundational visual design system for **ryankelly.dev** and all personal web applications. Built around a **brutalist / neon-terminal** aesthetic: hard edges, zero border-radius, offset shadows, and dual-mode (`dark`, `dim`, `sketch`) paper-and-ink themes.

Published to the public **npm registry** as `@rtkelly13/design-system` (via npm trusted publishing — see `.github/workflows/publish-package.yml`).

---

## 📸 Visual Regression Layer

The design system incorporates a **Playwright Visual Snapshot Testing Layer** matching the architecture of **ryankelly.dev**:

- **Framework**: Playwright snapshot engine (`playwright.config.ts` & `tests/visual.spec.ts`).
- **Isolation**: Runs against static Storybook builds (`http://localhost:6006`).
- **Precision**: `maxDiffPixelRatio: 0.002` (0.2% max pixel tolerance).
- **Platform Integrity**: Executed strictly on Linux CI runners to prevent macOS / Windows font rendering variations.

```bash
# Run visual regression suite locally:
pnpm test:visual

# Update visual snapshots:
pnpm test:visual:update
```

---

## 📦 Installation & Prerelease Testing

### Stable Release

```bash
pnpm add @rtkelly13/design-system
```

No registry configuration needed — it's a public npm package.

### Dev Prerelease Testing

Comment `/publish-dev` on a Pull Request and CI publishes that branch as
`<version>-dev.<pr>.<short-sha>` under the `dev` dist-tag:

```bash
pnpm add @rtkelly13/design-system@dev          # latest dev build
pnpm view @rtkelly13/design-system dist-tags   # exact versions per PR
```

---

## ⚡ Usage & Setup

### 1. Import Stylesheet & Theme Provider

In your app entrypoint (`_app.tsx`, `main.tsx`, or `layout.tsx`):

```tsx
import '@rtkelly13/design-system/styles.css';
import { ThemeProvider, Button, Card, PageTitle, Badge, AsciiDivider } from '@rtkelly13/design-system';

export function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <main style={{ padding: '2rem' }}>
        <PageTitle subtitle="Foundation Design System Surface">
          [ MY APPLICATION ]
        </PageTitle>

        <Card>
          <Badge accent="cyan">v1.2.0 ACTIVE</Badge>
          <p style={{ margin: '1rem 0' }}>
            Brutalist dual-mode UI surface shared across all projects.
          </p>
          <Button bracketed variant="pink">
            EXECUTE ACTION
          </Button>
        </Card>

        <AsciiDivider />
      </main>
    </ThemeProvider>
  );
}
```

---

### 2. Tailwind CSS v4 token contract

Import the theme contract in your CSS entrypoint — it ships the brutalist
`@theme` tokens, the `.dark`/`.dim` dark variant, the per-mode variable
blocks, and an `@source` directive so utilities used inside the compiled
components are generated in your build:

```css
@import "tailwindcss";
@import "@rtkelly13/design-system/theme.css";
```

`styles.css` = `theme.css` + web-font imports + opinionated global resets
(zero border-radius everywhere, base typography). Import one or the other,
not both.

---

## 🛠 Repository & Publishing

- **Repository**: `https://github.com/rtkelly13/design-system`
- **npm**: `@rtkelly13/design-system` on `https://registry.npmjs.org`
- **CI Pipelines**:
  - `ci.yml`: Typecheck, package build, Storybook build, and Linux visual regression testing.
  - `publish-package.yml`: npm publishing (stable on main, dev prereleases via dispatch).
  - `publish-dev-command.yml`: `/publish-dev` PR comment handler.
  - `update-snapshots.yml`: On-demand visual snapshot regeneration.
