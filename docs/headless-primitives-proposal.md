# Architectural Proposal: Headless State Engines & TanStack Primitives for `@rtkelly13/design-system`

**Status:** Proposed  
**Author:** Ryan Kelly & Antigravity  
**Date:** 2026-08-21  
**Target:** `@rtkelly13/design-system` (`v0.4.0+`)  

---

## 1. Executive Summary & Objective

`@rtkelly13/design-system` has established a robust design language built on:
- A four-rung theme ladder (`midnight` → `dim` → `bright` → `white`).
- Zero border-radius (`0px !important`).
- Hard offset shadows (`shadow-hard-*`).
- Semantic roles over raw color values (`bg-surface-base`, `border-edge-strong`, `text-content-primary`, `accent-primary`).
- TSX-first styling managed with recipes (`src/lib/recipe.ts`).

However, complex interactive components—such as data tables, command palettes, multi-step forms, dropdowns, and virtualized feeds—currently either lack state engines entirely (e.g. `DataTable` is static) or rely on handwritten DOM handlers.

This proposal outlines the strategy for adopting **headless state engines (TanStack & Radix UI / cmdk)** following the **Shadcn architectural paradigm**:
> **Headless libraries own state machines, data transformations, keyboard traps, and ARIA attributes; `@rtkelly13/design-system` owns the markup and strict brutalist visual contract.**

---

## 2. Problem Statement: Current Gaps

| Component Domain | Current State in Repo | Pain Point / Limitation |
| :--- | :--- | :--- |
| **Data Tables** (`DataTable.tsx`) | Static mapping over arrays | No sorting, filtering, column visibility, row selection, pagination, or virtualization. Consumers must reinvent table state. |
| **Forms & Fields** (`Input.tsx`, `Select.tsx`) | Unmanaged native HTML elements | Form validation, dirty/touched state, async checking, and error formatting are ad-hoc across consuming apps. |
| **Command Search** | Absent in design-system (`kbar` in blog) | No shared spotlight search (`⌘K`) with brutalist theming. |
| **Floating Overlays** | Absent (no dropdowns, popovers, tooltips) | Complex positioning (collision detection, boundary flips, focus return) cannot be done reliably with pure CSS. |
| **Large Lists / Logs** | Rendered entirely into DOM | DOM bloat when rendering audit trails, markdown archives, or telemetry feeds. |

---

## 3. The Architectural Contract: Headless Engine + Semantic Skin

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    @rtkelly13/design-system THEME CONTRACT                  │
│   Theme Ladder (midnight | dim | bright | white) + Semantic Tokens (TSX)    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
          ┌────────────────────────────┴────────────────────────────┐
          ▼                                                         ▼
┌─────────────────────────────────────────┐   ┌─────────────────────────────────────────┐
│           TANSTACK ECOSYSTEM            │   │      HEADLESS ACCESSIBLE PRIMITIVES     │
│       (Data & State Management)         │   │         (UI Interaction State)          │
├─────────────────────────────────────────┤   ├─────────────────────────────────────────┤
│ • @tanstack/react-table (Data Engine)   │   │ • Radix UI / Zag.js (Floating & Focus)  │
│ • @tanstack/react-form (Form Engine)    │   │ • Floating UI (Tooltips & Popovers)     │
│ • @tanstack/react-virtual (Virtualizer) │   │ • cmdk (Command Palette / Search)       │
│ • @tanstack/react-query (Async State)   │   │ • @radix-ui/react-dropdown-menu         │
└─────────────────────────────────────────┘   └─────────────────────────────────────────┘
```

### Design System Principles Enforced Across All Primitives
1. **Zero Border Radius (`0px`)**: Every dropdown, popover, command modal, and table cell adheres strictly to square corners.
2. **Semantic Role Compliance**: Components consume `surface-*`, `edge-*`, `content-*`, and `accent-*` variables mapped by the four theme ladder levels.
3. **Hard Offset Shadows**: Floating elements use `shadow-hard-md` (4px offset) or `shadow-hard-lg` (6px offset).
4. **Bracketed Display Typography**: Headers and interactive triggers format in Space Grotesk `[ BRACKETED ]` display type.
5. **No Style Injections in CSS**: All styling is declared via Tailwind classes on TSX elements using `recipe()`.

---

## 4. TanStack Integration Strategy

### 4.1 `@tanstack/react-table` → Advanced Brutalist Data Engine

Upgrade or augment `DataTable` to support `@tanstack/react-table`.

#### Capabilities
- Multi-column sorting with bracketed glyphs: `[ REPO NAME ▲ ]`, `[ CREATED ▼ ]`.
- Column filtering, global search, and faceted status filters.
- Row selection (checkboxes) and bulk operations toolbar.
- Responsive pagination controls integrated with `Pagination.tsx`.
- Server-side and client-side data models.

#### Component Architecture
```tsx
import { useReactTable, getCoreRowModel, getSortedRowModel, type Table } from '@tanstack/react-table';
import { TableHeader, TableRow, TableHead, TableBody, TableCell, TableFooter } from './Table';

export interface BrutalistTableProps<TData> {
  table: Table<TData>;
  emptyMessage?: string;
  className?: string;
}
```

---

### 4.2 `@tanstack/react-form` → Type-Safe Brutalist Form Infrastructure

A declarative form pipeline that handles validation, state, and errors without heavy runtime overhead.

#### Capabilities
- Per-field validation with standard schema validators (Zod / Valibot).
- Granular subscriptions (preventing full form re-renders on keystrokes).
- Terminal-style error banners: `> [ERROR: Value must be at least 8 characters]`.
- First-class integration with `Input`, `TextArea`, `Select`, and `Checkbox`.

#### Component Architecture
```tsx
import { useForm } from '@tanstack/react-form';
import { FormField, FormItem, FormLabel, FormMessage } from './Form';

// Consumer usage:
<form.Field name="callsign">
  {(field) => (
    <FormItem>
      <FormLabel>[ NODE CALLSIGN ]</FormLabel>
      <Input
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        error={field.state.meta.errors?.[0]}
      />
      <FormMessage>{field.state.meta.errors?.[0]}</FormMessage>
    </FormItem>
  )}
</form.Field>
```

---

### 4.3 `@tanstack/react-virtual` → Virtualized Feeds & Infinite Logs

#### Capabilities
- Render 10,000+ log lines or table rows at 60fps.
- Dynamic row height measurement.
- Monospace terminal log container with hard scroll indicators.

---

## 5. Headless UI Primitives (Radix UI / `cmdk`)

### 5.1 Command Palette (`cmdk` → `<CommandMenu>`)
- **Use Case**: Global `⌘K` spotlight modal for quick navigation, keyboard shortcuts, and site-wide actions.
- **Visuals**:
  - Backdrop blur with `bg-surface-overlay`.
  - Monospace search input with `> ` prompt and blinking cursor.
  - Bracketed group headers: `[ RECENT POSTS ]`, `[ SYSTEM ACTIONS ]`.
  - Hard offset border and shadow.

### 5.2 Dropdown & Context Menu (`@radix-ui/react-dropdown-menu`)
- **Use Case**: Action menus on table rows, user account menus in navigation bars, and right-click context menus.
- **Visuals**:
  - Floating container with `border-2 border-edge-strong bg-surface-raised shadow-hard-md`.
  - Item hover state: `hover:bg-surface-base hover:text-accent-primary`.
  - Full keyboard navigation with automatic arrow key cycling and collision boundary detection.

### 5.3 Popover & Tooltip (`@radix-ui/react-popover`, `@radix-ui/react-tooltip`)
- **Use Case**: Inline filters, hover helper labels, and info disclosures.
- **Visuals**: Square-edge callout boxes with high-contrast text and zero border radius.

---

## 6. Dependency & Packaging Strategy

Every added dependency must satisfy the invariants in `scripts/check-deps.mjs`:
1. Documented in `MANIFEST` with a `kind` and explicit `why`.
2. Shipped bundle imports must be `dependencies` or `peerDependencies` (never `devDependencies`).
3. Clean separation between core presentation and heavy state adapters.

### Packaging Options

| Option | Approach | Trade-off |
| :--- | :--- | :--- |
| **A: Direct Core Dependencies** | Add `@tanstack/react-table`, `cmdk`, `@radix-ui/react-dropdown-menu` as runtime `dependencies`. | Simplest consumer DX (`import { DataTable, CommandMenu } from '@rtkelly13/design-system'`). Slightly larger bundle size. |
| **B: Subpath Exports** | Export subpaths (`./table`, `./form`, `./command`) with optional peer dependencies. | Minimal core bundle size, but consumers must configure subpath imports. |
| **C: Lightweight Core + Headless Primitives** | Bundle lightweight headless primitives (Radix, cmdk) as runtime dependencies; keep TanStack Table/Form as peer or composable adapters. | **Recommended.** Delivers full out-of-the-box UI for floating controls & command palettes, while allowing data tables to accept either raw data or TanStack table instances. |

---

## 7. Implementation Roadmap

```
Phase 1: Headless Data Table Foundations
  ├── Step 1.1: Add `@tanstack/react-table` to package manifest & check-deps.
  ├── Step 1.2: Implement compound `<Table>` primitives (`Table`, `TableHeader`, `TableHead`, `TableBody`, `TableRow`, `TableCell`).
  ├── Step 1.3: Enhance `<DataTable>` with TanStack Table integration (sorting, search, pagination).
  ├── Step 1.4: Add Vitest unit tests & Storybook stories across all 4 theme levels.
  └── Step 1.5: Run required checks (`check:deps`, `lint`, `typecheck`, `test`).

Phase 2: Floating Primitives (DropdownMenu, Popover, Tooltip)
  ├── Step 2.1: Integrate `@radix-ui/react-dropdown-menu`, `@radix-ui/react-popover`, `@radix-ui/react-tooltip`.
  ├── Step 2.2: Implement brutalist themed wrappers with `recipe()`.
  └── Step 2.3: Unit test keyboard trapping and interaction in Vitest.

Phase 3: Brutalist Command Palette (`<CommandMenu>`)
  ├── Step 3.1: Integrate `cmdk`.
  ├── Step 3.2: Build `<CommandMenu>` modal container with keyboard shortcuts (`⌘K`).
  └── Step 3.3: Add Storybook stories and visual test baseline.

Phase 4: Form Engine Integration (`@tanstack/react-form`)
  ├── Step 4.1: Create type-safe `<Form>` and `<FormField>` adapters for Input/Select/TextArea.
  └── Step 4.2: Build example validation workflow in Storybook.
```

---

## 8. Verification & Quality Gates

Every implementation PR must pass the repository check ratchet:
1. `pnpm typecheck` — Strict TypeScript validation.
2. `pnpm test` — Vitest unit suite over component behaviors and hook contracts.
3. `pnpm lint` — ESLint checking semantic role usage (no hardcoded color literals).
4. `pnpm check:deps` — Dependency audit against `MANIFEST`.
5. `pnpm check:css` — Zero unauthorized style declarations in CSS files.
6. `pnpm check:contrast` — WCAG contrast validation across all 4 theme ladder levels (`midnight`, `dim`, `bright`, `white`).
7. `pnpm check:visual-coverage` — Visual regression coverage in Storybook.
8. `pnpm build` & `pnpm build-storybook` — Production bundle and documentation compilation.
