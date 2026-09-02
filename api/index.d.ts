import * as react from 'react';
import react__default, { ReactNode, DetailedHTMLProps, ButtonHTMLAttributes, AnchorHTMLAttributes, HTMLAttributes, ElementType, MouseEventHandler, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

type Emphasis = 'primary' | 'secondary' | 'tertiary' | 'quiet';

type Intent = 'info' | 'success' | 'warning' | 'danger';

type Surface = 'base' | 'raised' | 'sunken' | 'overlay';

type TextTone = 'primary' | 'secondary' | 'muted' | 'inverse';

type BorderTone = 'strong' | 'default' | 'subtle';

type LegacyAccent = 'cyan' | 'pink' | 'yellow' | 'green';

type AccentToken = Emphasis | Intent | LegacyAccent;

declare function accentVar(token: AccentToken | undefined, fallback?: AccentToken): string;
declare function surfaceVar(token?: Surface): string;
declare function textVar(token?: TextTone): string;
declare function borderVar(token?: BorderTone): string;

declare const fontVar: {
    readonly display: "var(--ds-font-display)";
    readonly body: "var(--ds-font-body)";
    readonly mono: "var(--ds-font-mono)";
    readonly pixel: "var(--ds-font-pixel)";
};

declare const HEADING_EMPHASIS: Record<1 | 2 | 3 | 4 | 5 | 6, Emphasis>;

declare const semanticTokens: {
    readonly accent: Record<Emphasis, string>;
    readonly intent: Record<Intent, string>;
    readonly surface: Record<Surface, string>;
    readonly text: Record<TextTone, string>;
    readonly border: Record<BorderTone, string>;
    readonly font: {
        readonly display: "var(--ds-font-display)";
        readonly body: "var(--ds-font-body)";
        readonly mono: "var(--ds-font-mono)";
        readonly pixel: "var(--ds-font-pixel)";
    };
    readonly shadowColor: "var(--ds-shadow-color)";
};

declare const THEME_LEVELS: readonly ["midnight", "dim", "bright", "white"];

type ThemeLevel = (typeof THEME_LEVELS)[number];

type Polarity = 'dark' | 'light';

interface LevelDefinition {

    readonly label: string;

    readonly description: string;
    readonly polarity: Polarity;
    readonly surface: Readonly<Record<Surface, string>>;
    readonly text: Readonly<Record<TextTone, string>>;
    readonly border: Readonly<Record<BorderTone, string>>;
    readonly accent: Readonly<Record<Emphasis, string>>;
    readonly intent: Readonly<Record<Intent, string>>;

    readonly shadow: string;
}

declare const LEVELS: Readonly<Record<ThemeLevel, LevelDefinition>>;

declare const DEFAULT_LEVEL: ThemeLevel;

declare const SYSTEM_LEVEL: Readonly<Record<Polarity, ThemeLevel>>;

declare function isThemeLevel(value: unknown): value is ThemeLevel;

declare function nextLevel(level: ThemeLevel): ThemeLevel;

declare function levelsByPolarity(polarity: Polarity): ThemeLevel[];

declare function assertNever(value: never, message?: string): never;

declare const brutalistTokens: {
    readonly colors: {
        readonly cyan: "var(--ds-accent-primary)";
        readonly pink: "var(--ds-accent-tertiary)";
        readonly yellow: "var(--ds-accent-secondary)";
        readonly neonGreen: "var(--ds-intent-success)";
        readonly neonCyan: "var(--ds-accent-primary)";
        readonly cyberOrange: "var(--ds-accent-secondary)";
        readonly darkBg: "var(--ds-surface-base)";
        readonly black: "var(--ds-surface-base)";
        readonly white: "var(--ds-text-primary)";
    };
    readonly fonts: {
        readonly display: readonly ["var(--ds-font-display)"];
        readonly sans: readonly ["var(--ds-font-body)"];
        readonly mono: readonly ["var(--ds-font-mono)"];
        readonly pixel: readonly ["var(--ds-font-pixel)"];
    };
    readonly shadows: {
        readonly hardSm: "2px 2px 0px 0px var(--ds-shadow-color)";
        readonly hardMd: "4px 4px 0px 0px var(--ds-shadow-color)";
        readonly hardLg: "6px 6px 0px 0px var(--ds-shadow-color)";
        readonly hardCyan: "4px 4px 0px 0px var(--ds-accent-primary)";
        readonly hardPink: "4px 4px 0px 0px var(--ds-accent-tertiary)";
        readonly hardYellow: "4px 4px 0px 0px var(--ds-accent-secondary)";
        readonly glowCyan: "0 0 10px color-mix(in oklab, var(--ds-accent-primary) 50%, transparent), 0 0 20px color-mix(in oklab, var(--ds-accent-primary) 30%, transparent)";
        readonly glowPink: "0 0 10px color-mix(in oklab, var(--ds-accent-tertiary) 50%, transparent), 0 0 20px color-mix(in oklab, var(--ds-accent-tertiary) 30%, transparent)";
        readonly glowOrange: "0 0 20px color-mix(in oklab, var(--ds-accent-secondary) 80%, transparent), 0 0 40px color-mix(in oklab, var(--ds-accent-secondary) 50%, transparent)";
    };
    readonly borders: {
        readonly standard: "2px solid var(--ds-border-strong)";
        readonly radius: "0px";
    };
};

type BrutalistTheme = ThemeLevel;

interface Rgb {
    r: number;
    g: number;
    b: number;

    a: number;
}

declare function parseColor(value: string): Rgb;

declare function composite(foreground: Rgb, backdrop: Rgb): Rgb;

declare function relativeLuminance(color: Rgb): number;

declare function contrastRatio(foreground: string, background: string): number;

declare const MINIMUM_RATIO: {
    readonly text: 4.5;

    readonly textInverse: 4.5;
    readonly accent: 4.5;
    readonly intent: 4.5;
    readonly borderStrong: 3;
    readonly borderDefault: 3;
    readonly borderSubtle: 1.4;

    readonly overlaySeparation: 3;
};
interface ContrastCheck {
    level: ThemeLevel;

    pair: string;
    foreground: string;
    background: string;
    ratio: number;
    minimum: number;
    passes: boolean;
}

declare function auditContrast(ladder: Readonly<Record<ThemeLevel, LevelDefinition>>): ContrastCheck[];

type ClassInput = string | number | null | undefined | false | ClassInput[];

declare function cn(...inputs: ClassInput[]): string;

declare function slugify(value: string): string;

declare class Slugger {
    private readonly seen;
    slug(value: string): string;
    reset(): void;
}

declare function childrenToText(node: unknown): string;

interface UseCopyToClipboardResult {

    copied: boolean;

    failed: boolean;
    copy: (value: string) => Promise<boolean>;
}

declare function useCopyToClipboard(resetAfter?: number): UseCopyToClipboardResult;

interface UseActiveHeadingOptions {

    offset?: number;

    enabled?: boolean;
}

declare function useActiveHeading(ids: readonly string[], { offset, enabled }?: UseActiveHeadingOptions): string | null;

interface ButtonOwnProps {
    children: ReactNode;

    variant?: 'cyan' | 'pink' | 'yellow' | 'white' | 'default';
    size?: 'sm' | 'md' | 'lg';
    bracketed?: boolean;
    className?: string;
}

type ButtonElementProps = ButtonOwnProps & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
    href?: never;
};

type ButtonLinkProps = ButtonOwnProps & DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> & {
    href: string;
};
type ButtonProps = ButtonElementProps | ButtonLinkProps;

declare function Button(props: ButtonProps): react.JSX.Element;

type CardAccent = 'cyan' | 'pink' | 'yellow' | 'green';
interface CardProps extends HTMLAttributes<HTMLDivElement> {
    title?: string;
    description?: string;
    imgSrc?: string;
    href?: string;
    asciiArt?: string;
    filename?: string;
    children?: ReactNode;
    className?: string;

    accent?: AccentToken;

    badge?: string;

    panel?: boolean;
}
declare function Card({ title, description, imgSrc, href, asciiArt, filename, children, className, accent, badge, panel, style, ...props }: CardProps): react.JSX.Element;

interface BadgeProps extends react__default.HTMLAttributes<HTMLSpanElement> {
    children: react__default.ReactNode;

    accent?: AccentToken;
}
declare const Badge: react__default.FC<BadgeProps>;

interface AvatarProps extends react__default.HTMLAttributes<HTMLDivElement> {
    src?: string;
    alt?: string;
    fallback?: string;
    size?: 'sm' | 'md' | 'lg';
    accent?: 'cyan' | 'pink' | 'yellow' | 'green';
}
declare const Avatar: react__default.FC<AvatarProps>;

interface PageTitleProps extends HTMLAttributes<HTMLHeadingElement> {
    children: ReactNode;
    subtitle?: string;
    bracketed?: boolean;
    className?: string;
}
declare function PageTitle({ children, subtitle, bracketed, className, ...props }: PageTitleProps): react.JSX.Element;

type PageHeaderAccent = 'cyan' | 'pink' | 'yellow' | 'green';
interface PageHeaderProps {

    title: string;

    subtitle?: ReactNode;

    icon?: ElementType<{
        className?: string;
    }>;

    accent?: AccentToken;

    children?: ReactNode;

    className?: string;
}
declare function PageHeader({ title, subtitle, icon: Icon, accent, children, className, }: PageHeaderProps): react.JSX.Element;

type TagAccent = 'yellow' | 'cyan' | 'pink' | 'green';
interface TagProps {

    text: string;

    href?: string;

    accent?: AccentToken;

    onClick?: MouseEventHandler<HTMLElement>;

    className?: string;

    prefix?: string;
    children?: ReactNode;
}
declare function Tag({ text, href, accent, onClick, className, prefix, }: TagProps): react.JSX.Element;

interface PaginationProps {
    totalPages: number;
    currentPage: number;
    onPageChange?: (page: number) => void;
    getPageHref?: (page: number) => string;
    className?: string;
}
declare function Pagination({ totalPages, currentPage, onPageChange, getPageHref, className, }: PaginationProps): react.JSX.Element;

interface SectionContainerProps {
    children: ReactNode;
    className?: string;
}
declare function SectionContainer({ children, className }: SectionContainerProps): react.JSX.Element;

type DividerVariant = 'auto' | 'terminal' | 'pencil';

declare const DIVIDER_PATTERNS: Readonly<Record<Polarity, string>>;
interface DividerProps extends react__default.HTMLAttributes<HTMLDivElement> {

    variant?: DividerVariant;

    pattern?: string;
}
declare const Divider: react__default.FC<DividerProps>;

type AsciiDividerProps = DividerProps;

declare const AsciiDivider: react__default.FC<AsciiDividerProps>;

declare const THEME_STORAGE_KEY = "ds-theme-level";

declare const THEME_ATTRIBUTE = "data-theme";
interface ThemeContextValue {
    level: ThemeLevel;

    polarity: Polarity;
    setLevel: (level: ThemeLevel) => void;

    cycleLevel: () => void;

    levels: readonly ThemeLevel[];
}
interface ThemeProviderProps {
    children: react__default.ReactNode;

    defaultLevel?: ThemeLevel;

    persist?: boolean;

    followSystem?: boolean;

    scoped?: boolean;

    className?: string;
}

declare function getThemeInitScript(options?: {
    defaultLevel?: ThemeLevel;
    followSystem?: boolean;
}): string;
declare const ThemeProvider: react__default.FC<ThemeProviderProps>;
declare const useTheme: () => ThemeContextValue;

declare const useOptionalTheme: () => ThemeContextValue | undefined;

interface BracketTextProps extends HTMLAttributes<HTMLSpanElement> {
    children: ReactNode;

    accent?: AccentToken | 'white';
    className?: string;
}
declare function BracketText({ children, accent, className, ...props }: BracketTextProps): react.JSX.Element;

interface NoteBlockProps {
    type?: 'note' | 'tip' | 'warning' | 'important';
    title?: string;
    children: react__default.ReactNode;
}
declare const NoteBlock: react__default.FC<NoteBlockProps>;

interface TLDRProps {
    children: react__default.ReactNode;
}
declare const TLDR: react__default.FC<TLDRProps>;

interface FieldProps {
    label?: string;
    error?: string;
    helperText?: string;

    accent?: AccentToken;
    className?: string;
}
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>, FieldProps {
}
declare function Input({ label, error, helperText, accent, className, id, ...props }: InputProps): react.JSX.Element;
interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>, FieldProps {
}
declare function TextArea({ label, error, helperText, accent, className, id, ...props }: TextAreaProps): react.JSX.Element;
interface SelectOption {
    label: string;
    value: string;
}
interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'>, FieldProps {
    options: SelectOption[];
}
declare function Select({ label, error, helperText, options, accent, className, id, ...props }: SelectProps): react.JSX.Element;

type StatCardAccent = AccentToken;
interface StatCardProps {
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    subtitle?: string;
    icon?: ElementType<{
        className?: string;
    }>;
    accent?: StatCardAccent;
    className?: string;
}
declare function StatCard({ title, value, change, changeType, subtitle, icon: Icon, accent, className, }: StatCardProps): react.JSX.Element;

interface Column<T> {
    header: string;
    accessor: keyof T | ((row: T) => ReactNode);
    className?: string;
}
interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyExtractor: (row: T, index: number) => string | number;
    emptyText?: string;
    className?: string;
}
declare function DataTable<T>({ columns, data, keyExtractor, emptyText, className, }: DataTableProps<T>): react.JSX.Element;

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;

    closeOnBackdropClick?: boolean;
    className?: string;
}

declare function Modal({ isOpen, onClose, title, children, footer, closeOnBackdropClick, className, }: ModalProps): react.ReactPortal | null;

interface SlideProps {
    title?: string;
    subtitle?: string;
    children: react__default.ReactNode;
    speakerNotes?: string;
}
declare const Slide: react__default.FC<SlideProps>;

interface SlideDeckProps {
    children: react__default.ReactElement[];
    aspectRatio?: '16:9' | '4:3';
    autoPlayInterval?: number;
}
declare const SlideDeck: react__default.FC<SlideDeckProps>;

interface BlogPostProps {
    title: string;
    subtitle?: string;
    author?: string;
    date: string;
    readingTime?: string;
    tags?: string[];
    children: react__default.ReactNode;
}
declare const BlogPost: react__default.FC<BlogPostProps>;

declare const LoremIpsumPost: react__default.FC;

interface ExperimentItem {
    id: string;
    name: string;
    description: string;
    icon?: react__default.ReactNode;
    status: 'active' | 'archived' | 'experimental';
    componentCount: number;
}
declare const DEFAULT_EXPERIMENTS: ExperimentItem[];
interface ExperimentsViewProps {
    onSelectExperiment?: (id: string) => void;
}
declare const ExperimentsView: react__default.FC<ExperimentsViewProps>;

declare const DesignSandbox: react__default.FC;

interface PricingTier {
    name: string;
    price: string;
    period?: string;
    description: string;
    features: string[];
    accent: 'cyan' | 'pink' | 'yellow' | 'green';
    highlighted?: boolean;
    ctaText?: string;
}

declare const DEFAULT_PRICING_TIERS: PricingTier[];

declare const DEFAULT_DEPLOY_LOG = "$ platform deploy --environment production\n[\u2713] Connecting to local datastore... OK\n[\u2713] Verifying 1,420 records against checksum... OK\n[\u2713] Running automation rules... APPLIED\n[\u2713] Versioned backup written to ./backups/2026-01-01/\n[*] Surface ready! Server active on http://localhost:8000";
interface SaasLandingPageProps {
    title?: string;
    subtitle?: string;
    pricingTiers?: PricingTier[];

    deployLog?: string;
}
declare const SaasLandingPage: react__default.FC<SaasLandingPageProps>;

interface AdminNavItem {
    id: string;
    label: string;
    icon?: react__default.ReactNode;
    badgeCount?: number;
}
declare const DEFAULT_ADMIN_NAV: AdminNavItem[];
interface AdminStatusBadge {
    id: string;
    label: string;
    accent?: 'green' | 'cyan' | 'pink' | 'yellow';
    icon?: react__default.ReactNode;
}

declare const DEFAULT_ADMIN_STATUS: AdminStatusBadge[];
interface AdminDashboardLayoutProps {
    appTitle?: string;
    navItems?: AdminNavItem[];

    statusBadges?: AdminStatusBadge[];
    activeNavId?: string;
    onNavSelect?: (id: string) => void;
    children?: react__default.ReactNode;
}
declare const AdminDashboardLayout: react__default.FC<AdminDashboardLayoutProps>;

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
interface AnchorHeadingProps extends Omit<HTMLAttributes<HTMLHeadingElement>, 'id'> {
    level: HeadingLevel;
    children: ReactNode;

    id?: string;

    anchor?: boolean;

    emphasis?: AccentToken;
}

declare function AnchorHeading({ level, children, id, anchor, emphasis, className, ...rest }: AnchorHeadingProps): react.JSX.Element;

declare function createAnchorHeading(level: HeadingLevel): {
    ({ children, id, ...rest }: HTMLAttributes<HTMLHeadingElement>): react.JSX.Element;
    displayName: string;
};

interface Crumb {
    label: string;

    href?: string;
}
interface BreadcrumbsProps {
    items: readonly Crumb[];

    separator?: string;
    className?: string;
}

declare function Breadcrumbs({ items, separator, className }: BreadcrumbsProps): react.JSX.Element | null;

interface CodeBlockProps extends HTMLAttributes<HTMLPreElement> {
    children: ReactNode;

    title?: string;

    language?: string;

    copyable?: boolean;
}

declare function CodeBlock({ children, title, language, copyable, className, ...rest }: CodeBlockProps): react.JSX.Element;

interface DocPagerTarget {
    label: string;
    href: string;
}
interface DocPagerProps {
    prev?: DocPagerTarget;
    next?: DocPagerTarget;
    className?: string;
}

declare function DocPager({ prev, next, className }: DocPagerProps): react.JSX.Element | null;

interface DocsNavItem {
    label: string;
    href: string;

    active?: boolean;
    external?: boolean;
}
interface DocsHeaderProps {

    title: string;

    titleHref?: string;

    icon?: ElementType<{
        className?: string;
    }>;

    nav?: readonly DocsNavItem[];

    onSearch?: () => void;

    searchShortcut?: string;

    onToggleSidebar?: () => void;
    sidebarOpen?: boolean;

    children?: ReactNode;
    className?: string;
}

declare function DocsHeader({ title, titleHref, icon: Icon, nav, onSearch, searchShortcut, onToggleSidebar, sidebarOpen, children, className, }: DocsHeaderProps): react.JSX.Element;

interface DocsLayoutProps {

    header?: ReactNode;

    sidebar?: ReactNode;

    toc?: ReactNode;
    children: ReactNode;

    sidebarOpen?: boolean;
    onCloseSidebar?: () => void;
    className?: string;
}

declare function DocsLayout({ header, sidebar, toc, children, sidebarOpen, onCloseSidebar, className, }: DocsLayoutProps): react.JSX.Element;

type DocsLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
};
interface DocsLinkProviderProps {

    component: ElementType<DocsLinkProps>;
    children: ReactNode;
}
declare function DocsLinkProvider({ component, children }: DocsLinkProviderProps): react.JSX.Element;
declare function useDocsLinkComponent(): ElementType<DocsLinkProps>;

declare function isExternalHref(href: string): boolean;

declare function DocsLink({ href, children, ...rest }: DocsLinkProps): react.JSX.Element;

interface DocsNavNode {
    label: string;

    href?: string;
    items?: readonly DocsNavNode[];

    defaultCollapsed?: boolean;
}
interface DocsSidebarProps {
    nav: readonly DocsNavNode[];

    currentPath?: string;

    label?: string | null;

    onNavigate?: () => void;
    className?: string;
}

declare function DocsSidebar({ nav, currentPath, label, onNavigate, className, }: DocsSidebarProps): react.JSX.Element;

interface ProseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
    children: ReactNode;

    brutalist?: boolean;
    className?: string;
}
declare function Prose({ children, brutalist, className, ...rest }: ProseProps): react.JSX.Element;

interface TocEntry {

    id: string;
    title: string;

    depth: number;
}
interface TableOfContentsProps {

    toc: readonly TocEntry[];

    fromDepth?: number;

    toDepth?: number;

    label?: string | null;

    spy?: boolean;
    className?: string;
}

declare function TableOfContents({ toc, fromDepth, toDepth, label, spy, className, }: TableOfContentsProps): react.JSX.Element | null;

declare function collectHeadings(container: ParentNode | null | undefined, selector?: string): TocEntry[];

declare function MdxPre({ children, ...rest }: HTMLAttributes<HTMLPreElement>): react.JSX.Element;
declare function MdxAnchor({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>): react.JSX.Element;

declare const mdxComponents: {
    h1: {
        ({ children, id, ...rest }: HTMLAttributes<HTMLHeadingElement>): react.JSX.Element;
        displayName: string;
    };
    h2: {
        ({ children, id, ...rest }: HTMLAttributes<HTMLHeadingElement>): react.JSX.Element;
        displayName: string;
    };
    h3: {
        ({ children, id, ...rest }: HTMLAttributes<HTMLHeadingElement>): react.JSX.Element;
        displayName: string;
    };
    h4: {
        ({ children, id, ...rest }: HTMLAttributes<HTMLHeadingElement>): react.JSX.Element;
        displayName: string;
    };
    h5: {
        ({ children, id, ...rest }: HTMLAttributes<HTMLHeadingElement>): react.JSX.Element;
        displayName: string;
    };
    h6: {
        ({ children, id, ...rest }: HTMLAttributes<HTMLHeadingElement>): react.JSX.Element;
        displayName: string;
    };
    pre: typeof MdxPre;
    a: typeof MdxAnchor;
    AnchorHeading: typeof AnchorHeading;
    NoteBlock: react.FC<NoteBlockProps>;
    TLDR: react.FC<TLDRProps>;
    Badge: react.FC<BadgeProps>;
    Card: typeof Card;
    Tag: typeof Tag;
    AsciiDivider: react.FC<DividerProps>;
    CodeBlock: typeof CodeBlock;
};
type MdxComponents = typeof mdxComponents;

export {
  type AccentToken,
  AdminDashboardLayout,
  type AdminDashboardLayoutProps,
  type AdminNavItem,
  type AdminStatusBadge,
  AnchorHeading,
  type AnchorHeadingProps,
  AsciiDivider,
  type AsciiDividerProps,
  Avatar,
  type AvatarProps,
  Badge,
  type BadgeProps,
  BlogPost,
  type BlogPostProps,
  type BorderTone,
  BracketText,
  type BracketTextProps,
  Breadcrumbs,
  type BreadcrumbsProps,
  type BrutalistTheme,
  Button,
  type ButtonElementProps,
  type ButtonLinkProps,
  type ButtonProps,
  Card,
  type CardAccent,
  type CardProps,
  type ClassInput,
  CodeBlock,
  type CodeBlockProps,
  type Column,
  type ContrastCheck,
  type Crumb,
  DEFAULT_ADMIN_NAV,
  DEFAULT_ADMIN_STATUS,
  DEFAULT_DEPLOY_LOG,
  DEFAULT_EXPERIMENTS,
  DEFAULT_LEVEL,
  DEFAULT_PRICING_TIERS,
  DIVIDER_PATTERNS,
  DataTable,
  type DataTableProps,
  DesignSandbox,
  Divider,
  type DividerProps,
  type DividerVariant,
  DocPager,
  type DocPagerProps,
  type DocPagerTarget,
  DocsHeader,
  type DocsHeaderProps,
  DocsLayout,
  type DocsLayoutProps,
  DocsLink,
  type DocsLinkProps,
  DocsLinkProvider,
  type DocsLinkProviderProps,
  type DocsNavItem,
  type DocsNavNode,
  DocsSidebar,
  type DocsSidebarProps,
  type Emphasis,
  type ExperimentItem,
  ExperimentsView,
  type ExperimentsViewProps,
  HEADING_EMPHASIS,
  type HeadingLevel,
  Input,
  type InputProps,
  type Intent,
  LEVELS,
  type LegacyAccent,
  type LevelDefinition,
  LoremIpsumPost,
  MINIMUM_RATIO,
  type MdxComponents,
  Modal,
  type ModalProps,
  NoteBlock,
  type NoteBlockProps,
  PageHeader,
  type PageHeaderAccent,
  type PageHeaderProps,
  PageTitle,
  type PageTitleProps,
  Pagination,
  type PaginationProps,
  type Polarity,
  type PricingTier,
  Prose,
  type ProseProps,
  type Rgb,
  SYSTEM_LEVEL,
  SaasLandingPage,
  type SaasLandingPageProps,
  SectionContainer,
  type SectionContainerProps,
  Select,
  type SelectOption,
  type SelectProps,
  Slide,
  SlideDeck,
  type SlideDeckProps,
  type SlideProps,
  Slugger,
  StatCard,
  type StatCardAccent,
  type StatCardProps,
  type Surface,
  THEME_ATTRIBUTE,
  THEME_LEVELS,
  THEME_STORAGE_KEY,
  TLDR,
  type TLDRProps,
  TableOfContents,
  type TableOfContentsProps,
  Tag,
  type TagAccent,
  type TagProps,
  TextArea,
  type TextAreaProps,
  type TextTone,
  type ThemeContextValue,
  type ThemeLevel,
  ThemeProvider,
  type ThemeProviderProps,
  type TocEntry,
  type UseActiveHeadingOptions,
  type UseCopyToClipboardResult,
  accentVar,
  assertNever,
  auditContrast,
  borderVar,
  brutalistTokens,
  childrenToText,
  cn,
  collectHeadings,
  composite,
  contrastRatio,
  createAnchorHeading,
  fontVar,
  getThemeInitScript,
  isExternalHref,
  isThemeLevel,
  levelsByPolarity,
  mdxComponents,
  nextLevel,
  parseColor,
  relativeLuminance,
  semanticTokens,
  slugify,
  surfaceVar,
  textVar,
  useActiveHeading,
  useCopyToClipboard,
  useDocsLinkComponent,
  useOptionalTheme,
  useTheme,
};
