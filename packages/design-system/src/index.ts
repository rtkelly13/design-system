// @rtkelly13/design-system main entrypoint

export * from './tokens';

// The theme ladder — the single source for level names, level colours, and the
// contrast arithmetic that gates them.
export * from './theme/levels';
export * from './theme/contrast';

// Semantic theming — prefer these over the raw palette in `tokens`.
export * from './lib/theme';
// Only `cn` is public. `recipe`'s type comes from the library that implements
// it, so exporting it would put that library back into the published .d.ts and
// make replacing it a breaking change. Components import it directly.
export { cn } from './lib/recipe';
export type { ClassInput } from './lib/recipe';
export * from './lib/slug';
// The colour-instead-of-role rules. Public because they are the design system's
// rules rather than one script's: `scripts/check-tokens.mjs` ratchets the
// components against them, and `@rtkelly13/ds-report` holds a report to them at
// budget zero. A second copy of these regexes would be a second, drifting truth.
export * from './lib/tokenRules';

// Hooks
export * from './hooks/useCopyToClipboard';
export * from './hooks/useActiveHeading';

// Primitives & Callouts
export * from './components/Button';
export * from './components/Card';
export * from './components/Badge';
export * from './components/Avatar';
export * from './components/PageTitle';
export * from './components/PageHeader';
export * from './components/Tag';
export * from './components/Pagination';
export * from './components/SectionContainer';
export * from './components/Divider';
export * from './components/AsciiDivider';
export * from './components/ThemeProvider';
export * from './components/BracketText';
export * from './components/NoteBlock';
export * from './components/TLDR';
export * from './components/Input';
export * from './components/StatCard';
export * from './components/DataTable';
export * from './components/Modal';

// Slides & Presentation Deck Engine
export * from './components/slides/Slide';
export * from './components/slides/SlideDeck';

// Blog & Editorial Post Foundations
export * from './components/blog/BlogPost';
export * from './components/blog/LoremIpsumPost';

// Experiments Page & Design System Sandbox
export * from './components/experiments/ExperimentsView';
export * from './components/experiments/DesignSandbox';

// SaaS Landing Pages & Admin Sites Foundations
export * from './components/saas/SaasLandingPage';
export * from './components/admin/AdminDashboardLayout';

// Documentation Portal Chrome & MDX Rendering
export * from './components/docs';

// Report Frame — the page layout a generated report is built in. The generator
// that renders it is a separate package, `@rtkelly13/ds-report`: it needs
// esbuild, Tailwind and a TypeScript compiler, none of which belongs in the
// dependency graph of an app that just wants the components.
export * from './components/ReportDocument';
