# 🎨 @rtkelly/design-system

The foundational visual design system for **ryankelly.dev** and all personal web applications. Built around a **brutalist / neon-terminal** aesthetic: hard edges, zero border-radius, offset shadows, and dual-mode (`dark`, `dim`, `sketch`) paper-and-ink themes.

Published directly to **GitHub Packages Feed** under the `@rtkelly` scope.

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

Configure `.npmrc` in your consumer project to point the `@rtkelly` scope to GitHub Packages:

```ini
@rtkelly:registry=https://npm.pkg.github.com
```

### Stable Release

```bash
pnpm add @rtkelly/design-system
```

### PR Prerelease Testing

Every Pull Request automatically publishes a prerelease version to GitHub Packages:

```bash
# Test PR #42 via PR tag:
pnpm add @rtkelly/design-system@pr-42
```

---

## ⚡ Usage & Setup

### 1. Import Stylesheet & Theme Provider

In your app entrypoint (`_app.tsx`, `main.tsx`, or `layout.tsx`):

```tsx
import '@rtkelly/design-system/styles.css';
import { ThemeProvider, Button, Card, PageTitle, Badge, AsciiDivider } from '@rtkelly/design-system';

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

## 🛠 Repository & GitHub Packages Feed

- **Repository**: `https://github.com/rtkelly13/design-system`
- **GitHub Package Feed**: `@rtkelly/design-system` on `https://npm.pkg.github.com`
- **CI Pipelines**:
  - `ci.yml`: Typecheck, package build, Storybook build, and Linux visual regression testing.
  - `publish-prerelease.yml`: Automated PR prerelease tagging.
  - `update-snapshots.yml`: On-demand visual snapshot regeneration.
