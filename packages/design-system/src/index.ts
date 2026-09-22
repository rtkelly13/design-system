// @rtkelly13/design-system main entrypoint

export * from './tokens';

// The theme ladder — the single source for level names, level colours, and the
// contrast arithmetic that gates them.
export * from './theme/levels';
export {
  MEDIA,
  CSS_MEDIUM,
  MEDIA_DEFINITIONS,
  isMedium,
} from './theme/media';
export type {
  Medium,
  MediumDefinition,
  TypeStep,
  TypeStepName,
  Motion,
} from './theme/media';
export * from './theme/contrast';
export { ANSI_SLOTS, SLOTS, ansiScheme } from './theme/ansi';
export type { AnsiSlot, AnsiScheme, AnsiChrome } from './theme/ansi';

// Semantic theming — prefer these over the raw palette in `tokens`.
export * from './lib/theme';
export * from './theme/recommended';
// Only `cn` is public. `recipe`'s type comes from the library that implements
// it, so exporting it would put that library back into the published .d.ts and
// make replacing it a breaking change. Components import it directly.
export { cn } from './lib/recipe';
export type { ClassInput } from './lib/recipe';
export * from './lib/slug';

// Hooks
export * from './hooks/useCopyToClipboard';
export * from './hooks/useActiveHeading';

// Primitives & Callouts
export * from './components/Button';
export * from './components/Card';
export * from './components/Badge';
// The report frame — the page a generated report is built in. Separate from
// the docs components because a report is written by a tool and read once,
// where a docs page is written by a person and read often: the frame owns the
// measure, the header strip and the print behaviour, and everything inside it
// is ordinary composition.
export * from './components/ReportDocument';

// The colour-instead-of-role rules, and the scanner over them. Published
// because a tool generating markup against this system should be able to hold
// itself to the same rule the system holds itself to — the report generator
// lints at budget zero with exactly these.
export { TOKEN_RULES, scanRules, scanTokenRules } from './lib/tokenRules';
export type { Finding, TokenRule } from './lib/tokenRules';
export * from './components/Avatar';
export * from './components/PageTitle';
export * from './components/PageHeader';
export * from './components/Tag';
export * from './components/Pagination';
// The tablist. There is exactly one in this tree: `CodeTabs` renders through
// it rather than hand-rolling a second keyboard model — see #240, and #163 for
// why it is first-party rather than a wrapper over Base UI.
export * from './components/Tabs';
export * from './components/SectionContainer';
export * from './components/Divider';
export * from './components/AsciiDivider';
export * from './components/ThemeProvider';
export * from './components/BracketText';
export * from './components/NoteBlock';
export * from './components/TLDR';
export * from './components/Input';
// The booleans, added together: one capability in two presentations,
// composing the same Field as the text controls above.
export * from './components/Checkbox';
export * from './components/Switch';
// The groups (#239): `Fieldset` and `Legend` are the set's label, description
// and error on the same Field contract, and `RadioGroup` / `Radio` are the
// choose-one control built on that frame rather than beside it.
export * from './components/Fieldset';
export * from './components/RadioGroup';
export * from './components/Swatch';
export * from './components/StatCard';
export * from './components/Table';
export * from './components/DataTable';
export * from './components/Modal';
export * from './components/AlertDialog';
export * from './components/Drawer';

// The application layout (#247): sidebar, topbar and main as five composable
// pieces, with the sidebar off-canvas in a `Drawer` below desktop width.
export * from './components/AppShell';

// System feedback — the three states an application has besides "loaded".
// One vocabulary on purpose: the same motion tokens, the same reduced-motion
// rule, the same muted surface, so a loading card and an empty table read as
// the same system rather than as two consumers' guesses.
export * from './components/Spinner';
export * from './components/Skeleton';
export * from './components/Progress';
export * from './components/EmptyState';

// The floating set (#166): anchored to a trigger, positioned by the same
// engine, dismissed by the same stack as the dialogs above. `Tooltip` labels,
// `Popover` shows content, `Menu` offers actions.
export * from './components/Tooltip';
export * from './components/Popover';
export * from './components/Menu';

// Site chrome (issue 246): the banner, the navigation in its two widths, and
// the footer — layouts and landmarks that hold no items of their own. The
// link adapter is the package's one, shared with the docs chrome: a router's
// `Link` and its current-route test are injected once and reach both.
export {
  LinkProvider,
  SiteLink,
  isExternalHref,
  useIsCurrentHref,
  useLinkComponent,
} from './components/LinkProvider';
export type {
  LinkComponentProps,
  LinkProviderProps,
  SiteLinkProps,
} from './components/LinkProvider';
export * from './components/SiteHeader';
export * from './components/SiteNav';
export * from './components/MobileNav';
export * from './components/SiteFooter';

// Transient notifications. Not an overlay: a toast shares neither the
// positioning nor the dismissal model of Tooltip/Popover/Menu — it is a queue,
// a live region and a lifetime (#243).
export * from './components/Toast';

export * from './components/NerdIcon';
export * from './components/SocialIcon';
export * from './components/Glyph';

// Chart Primitives & Trend Visualizers
export * from './components/BarChart';
export * from './components/Sparkline';
export * from './components/ChartTooltip';
export * from './components/BulletChart';

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
