# Headless Primitives & State Engines Guide

A developer guide for consuming the headless primitives in `@rtkelly13/design-system` (`DataTable`, `Table`, `DropdownMenu`, `Popover`, `Tooltip`, and `Command`).

---

## 1. Design Philosophy

Every headless component in `@rtkelly13/design-system` follows the **Shadcn architectural contract**:
- **Headless behavior**: Powered by industry-standard headless libraries (`@tanstack/react-table`, `@radix-ui/react-*`, and `cmdk`) for accessibility, focus management, and keyboard navigation.
- **Brutalist visual skin**: Strict 0px border-radius, hard offset shadows (`shadow-hard-md`, `shadow-hard-lg`), bracketed typography, and semantic ladder theming (`midnight`, `dim`, `bright`, `white`).
- **TSX-first styling**: All styles are composed via `recipe()` using semantic role variables (`bg-surface-base`, `border-edge-strong`, `text-content-primary`, `accent-primary`).

---

## 2. Table & DataTable (`@tanstack/react-table`)

### A. Simple Mode
For standard tables with built-in sorting and custom cell renderers:

```tsx
import { DataTable, Badge } from '@rtkelly13/design-system';

const columns = [
  { header: 'REPOSITORY', accessor: 'name' },
  {
    header: 'STATUS',
    accessor: (row) => <Badge accent="success">{row.status}</Badge>,
  },
  { header: 'COMMITS', accessor: 'commits' },
];

<DataTable
  columns={columns}
  data={repositories}
  keyExtractor={(row) => row.id}
  emptyText="NO REPOSITORIES FOUND"
/>
```

### B. Controlled TanStack Table Mode
For advanced data grids requiring custom filtering, column pinning, row selection, or server-side pagination:

```tsx
import {
  DataTable,
  Badge,
} from '@rtkelly13/design-system';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';

function RegistryTable({ data }) {
  const table = useReactTable({
    data,
    columns: [
      { accessorKey: 'id', header: 'ID' },
      { accessorKey: 'service', header: 'SERVICE' },
      { accessorKey: 'latency', header: 'LATENCY' },
    ],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return <DataTable table={table} />;
}
```

### C. Direct Compound `<Table>` Primitives
For manual or custom table layouts:

```tsx
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@rtkelly13/design-system';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>[ CLUSTER ]</TableHead>
      <TableHead>[ HEALTH ]</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>us-east-1</TableCell>
      <TableCell>ONLINE</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## 3. DropdownMenu (`@radix-ui/react-dropdown-menu`)

Provides accessible action menus, submenus, checkboxes, and radio groups.

```tsx
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  Button,
} from '@rtkelly13/design-system';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button bracketed>[ ACTIONS ▼ ]</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>POD CONTROLS</DropdownMenuLabel>
    <DropdownMenuItem onClick={deploy}>
      DEPLOY REPLICA
      <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
    </DropdownMenuItem>

    <DropdownMenuSub>
      <DropdownMenuSubTrigger>ENV SECRETS</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem>RELOAD VAULT</DropdownMenuItem>
        <DropdownMenuItem>ROTATE KEYS</DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>

    <DropdownMenuSeparator />
    <DropdownMenuItem variant="danger" onClick={purge}>
      PURGE RUNTIME
      <DropdownMenuShortcut>⇧⌘X</DropdownMenuShortcut>
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## 4. Popover (`@radix-ui/react-popover`)

Displays rich floating cards, disclosure panels, and detail inspectors.

```tsx
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
} from '@rtkelly13/design-system';

<Popover>
  <PopoverTrigger asChild>
    <Button bracketed>[ INSPECT NODE ]</Button>
  </PopoverTrigger>
  <PopoverContent>
    <div className="space-y-2">
      <h4 className="font-display text-sm font-bold uppercase">[ NODE METRICS ]</h4>
      <div className="space-y-1 font-mono text-xs text-content-muted">
        <div>&gt; CPU LOAD: 14.2%</div>
        <div>&gt; MEMORY: 1.8GB / 8GB</div>
      </div>
    </div>
  </PopoverContent>
</Popover>
```

---

## 5. Tooltip (`@radix-ui/react-tooltip`)

Lightweight monospace hover tooltips with automatic positioning.

```tsx
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Button,
} from '@rtkelly13/design-system';

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button size="sm">[ PING ]</Button>
    </TooltipTrigger>
    <TooltipContent>
      <span>&gt; Latency benchmark: 12ms</span>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

## 6. Command Palette (`cmdk`)

A spotlight search engine and keyboard navigation modal (`⌘K`).

```tsx
import { useState, useEffect } from 'react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from '@rtkelly13/design-system';

function SpotlightSearch() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <CommandDialog isOpen={open} onClose={() => setOpen(false)}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No matching commands found.</CommandEmpty>
        <CommandGroup heading="SYSTEM ACTIONS">
          <CommandItem onSelect={() => { deploy(); setOpen(false); }}>
            <span>DEPLOY APPLICATION</span>
            <CommandShortcut>⌘D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => { sync(); setOpen(false); }}>
            <span>SYNC VAULT SECRETS</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
```

---

## 7. Accessibility & Keyboard Shortcuts Summary

| Component | Keybinding | Behavior |
| :--- | :--- | :--- |
| **`DataTable`** | `Enter` / `Space` on `TableHead` | Toggles column sorting (Ascending → Descending → Natural) |
| **`DropdownMenu`** | `ArrowDown` / `ArrowUp` | Loops focus through menu items |
| | `ArrowRight` / `ArrowLeft` | Expands / collapses submenus |
| | `Escape` | Closes menu and returns focus to trigger |
| **`Popover`** | `Escape` | Closes popover and returns focus to trigger |
| **`Command`** | `ArrowDown` / `ArrowUp` | Selects search result |
| | `Enter` | Executes selected command item |
| | `Escape` | Closes command dialog |
