# 🎨 @rtkelly/design-system

The foundational visual design system for **ryankelly.dev** and all personal web applications. Built around a **brutalist / neon-terminal** aesthetic: hard edges, zero border-radius, offset shadows, and dual-mode (`dark`, `dim`, `sketch`) paper-and-ink themes.

Published directly to **GitHub Packages Feed** under the `@rtkelly` scope.

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

### PR Prerelease Testing (Test PRs in Downstream Apps)

Every Pull Request automatically publishes a prerelease version to GitHub Packages so you can test design system changes in your applications before merging:

```bash
# Test PR #42 via PR tag:
pnpm add @rtkelly/design-system@pr-42

# Or install exact prerelease version:
pnpm add @rtkelly/design-system@1.1.0-pr.42.a1b2c3d
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
          <Badge accent="cyan">v1.1.0 ACTIVE</Badge>
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

### 2. Tailwind CSS Integration

Include the preset in your `tailwind.config.js`:

```js
const { brutalistTailwindPreset } = require('@rtkelly/design-system/preset');

module.exports = {
  presets: [brutalistTailwindPreset],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@rtkelly/design-system/dist/**/*.js'
  ],
};
```

---

## 🎨 Dual-Mode Theming Architecture

1. **`dark` (High)**: High-contrast neon terminal (black background, white borders, neon cyan/pink/yellow accents).
2. **`dim`**: Softened dark mode for comfortable prolonged viewing.
3. **`sketch`**: Warm paper sheet background, graphite ink, letterpress ink offset shadows, blue/red/green pen accents.

Switch modes effortlessly using `useTheme()`:

```tsx
import { useTheme, Button } from '@rtkelly/design-system';

export function ThemeToggle() {
  const { theme, cycleTheme } = useTheme();
  return (
    <Button onClick={cycleTheme} bracketed>
      MODE: {theme.toUpperCase()}
    </Button>
  );
}
```

---

## 🛠 Repository & GitHub Packages Feed

- **Repository**: `https://github.com/rtkelly13/design-system`
- **GitHub Package Feed**: `@rtkelly/design-system` on `https://npm.pkg.github.com`
- **Release Pipeline**: Automated stable build on `main` tag & PR prerelease pipeline via `.github/workflows/publish-prerelease.yml`.
