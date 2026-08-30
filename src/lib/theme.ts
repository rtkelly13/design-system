/**
 * Semantic theming layer.
 *
 * Components should describe *what a thing is* — a primary accent, a danger
 * state, a raised surface — never which colour it happens to be. The brutalist
 * palette (cyan/pink/yellow/green) is one mapping of those roles; `.dim` and
 * `.sketch` are others, and a future mode is a third. Referencing
 * `var(--brutalist-cyan)` directly hard-codes today's mapping into every
 * component and makes retheming a find-and-replace across the package.
 *
 * The CSS variables below are declared in `theme.css` and resolve through the
 * raw palette, so they follow every mode swap automatically.
 */

/**
 * Visual weight within a hierarchy. Use for decorative and navigational
 * emphasis — which of several things should draw the eye first — not for
 * meaning. `quiet` is the de-emphasised step, not a fifth colour.
 */
export type Emphasis = 'primary' | 'secondary' | 'tertiary' | 'quiet';

/**
 * Communicated meaning. Use when the colour carries information the reader
 * must act on; these survive retheming because their semantics are fixed even
 * when their hues are not.
 */
export type Intent = 'info' | 'success' | 'warning' | 'danger';

/**
 * Background elevation. `base` is the page, `raised` sits above it (cards,
 * header, drawers), `sunken` is inset (code wells), `overlay` is modal.
 */
export type Surface = 'base' | 'raised' | 'sunken' | 'overlay';

/** Text prominence, coarsest to faintest. */
export type TextTone = 'primary' | 'secondary' | 'muted' | 'inverse';

/** Rule weight. `strong` is the full-contrast brutalist border. */
export type BorderTone = 'strong' | 'default' | 'subtle';

/**
 * A token role in rendered source code.
 *
 * Deliberately eight coarse roles rather than a grammar's full scope list. A
 * TextMate theme distinguishes `storage.modifier` from `keyword.control`; a
 * reader distinguishes neither at a glance, and every extra role costs
 * luminance range that {@link ../theme/separation} shows is already scarce.
 */
export type SyntaxRole =
  | 'keyword'
  | 'string'
  | 'number'
  | 'function'
  | 'type'
  | 'variable'
  | 'comment'
  | 'punctuation';

/**
 * The non-colour half of a syntax role.
 *
 * The light rungs need it. WCAG AA pins every colour into one luminance band
 * relative to the ground, and that band is narrower on paper than on black —
 * 117 steps against `white` versus 132 against `midnight`. Weight and slant are
 * a second axis that does not consume any of it. Solarized Light and GitHub
 * Light both lean on this; here it is a declared consequence rather than a
 * habit.
 */
export interface SyntaxEmphasis {
  readonly weight?: 400 | 500 | 600 | 700;
  readonly italic?: boolean;
}

/**
 * Palette names accepted by components predating the semantic layer.
 *
 * @deprecated Pass an {@link Emphasis} or {@link Intent} instead. These remain
 * accepted so existing consumers keep compiling, and they resolve to the same
 * values, but they defeat the point of the abstraction.
 */
export type LegacyAccent = 'cyan' | 'pink' | 'yellow' | 'green';

/** Anything a component's `accent`-style prop will take. */
export type AccentToken = Emphasis | Intent | LegacyAccent;

const EMPHASIS_VARS: Record<Emphasis, string> = {
  primary: 'var(--ds-accent-primary)',
  secondary: 'var(--ds-accent-secondary)',
  tertiary: 'var(--ds-accent-tertiary)',
  quiet: 'var(--ds-accent-quiet)',
};

const INTENT_VARS: Record<Intent, string> = {
  info: 'var(--ds-intent-info)',
  success: 'var(--ds-intent-success)',
  warning: 'var(--ds-intent-warning)',
  danger: 'var(--ds-intent-danger)',
};

/**
 * Legacy palette names map onto the same variables their semantic counterparts
 * use, so migrating a call site is a rename with no visual diff.
 */
const LEGACY_VARS: Record<LegacyAccent, string> = {
  cyan: 'var(--ds-accent-primary)',
  yellow: 'var(--ds-accent-secondary)',
  pink: 'var(--ds-accent-tertiary)',
  green: 'var(--ds-intent-success)',
};

const SURFACE_VARS: Record<Surface, string> = {
  base: 'var(--ds-surface-base)',
  raised: 'var(--ds-surface-raised)',
  sunken: 'var(--ds-surface-sunken)',
  overlay: 'var(--ds-surface-overlay)',
};

const TEXT_VARS: Record<TextTone, string> = {
  primary: 'var(--ds-text-primary)',
  secondary: 'var(--ds-text-secondary)',
  muted: 'var(--ds-text-muted)',
  inverse: 'var(--ds-text-inverse)',
};

const BORDER_VARS: Record<BorderTone, string> = {
  strong: 'var(--ds-border-strong)',
  default: 'var(--ds-border-default)',
  subtle: 'var(--ds-border-subtle)',
};

const SYNTAX_VARS: Record<SyntaxRole, string> = {
  keyword: 'var(--ds-syntax-keyword)',
  string: 'var(--ds-syntax-string)',
  number: 'var(--ds-syntax-number)',
  function: 'var(--ds-syntax-function)',
  type: 'var(--ds-syntax-type)',
  variable: 'var(--ds-syntax-variable)',
  comment: 'var(--ds-syntax-comment)',
  punctuation: 'var(--ds-syntax-punctuation)',
};

/**
 * Every syntax role, at runtime.
 *
 * Derived from {@link SYNTAX_VARS} rather than written a second time, so the
 * `Record` is the only place the roles are listed and a new one is a compile
 * error there before it is a missing entry here.
 */
export const SYNTAX_ROLES = Object.keys(SYNTAX_VARS) as readonly SyntaxRole[];

/**
 * Resolve any accent token to the CSS variable expression that renders it.
 *
 * Unknown values fall back to the primary accent rather than throwing —
 * a mistyped prop should degrade to something legible, not blank out a
 * component's colour and leave `color: undefined` on the element.
 */
export function accentVar(token: AccentToken | undefined, fallback: AccentToken = 'primary'): string {
  const resolved = token ?? fallback;
  return (
    EMPHASIS_VARS[resolved as Emphasis] ??
    INTENT_VARS[resolved as Intent] ??
    LEGACY_VARS[resolved as LegacyAccent] ??
    EMPHASIS_VARS.primary
  );
}

export function surfaceVar(token: Surface = 'base'): string {
  return SURFACE_VARS[token] ?? SURFACE_VARS.base;
}

export function textVar(token: TextTone = 'primary'): string {
  return TEXT_VARS[token] ?? TEXT_VARS.primary;
}

export function borderVar(token: BorderTone = 'strong'): string {
  return BORDER_VARS[token] ?? BORDER_VARS.strong;
}

export function syntaxVar(role: SyntaxRole): string {
  return SYNTAX_VARS[role] ?? SYNTAX_VARS.variable;
}

/**
 * The weight for a syntax role, with the fallback its sparse declaration needs.
 *
 * `syntaxEmphasis` is deliberately partial — a role that renders at the body
 * weight declares nothing, so `--ds-syntax-keyword-weight` exists on the light
 * rungs and not on the dark ones. Reading it without a fallback yields an
 * invalid value and the property is dropped, which is a silent wrong weight
 * rather than an error. Encoding the fallback here means no call site has to
 * know that, and no call site can forget.
 */
export function syntaxWeightVar(role: SyntaxRole): string {
  return `var(--ds-syntax-${role}-weight, 400)`;
}

/** The slant for a syntax role. Same fallback argument as {@link syntaxWeightVar}. */
export function syntaxStyleVar(role: SyntaxRole): string {
  return `var(--ds-syntax-${role}-style, normal)`;
}

/** Semantic font roles. */
export const fontVar = {
  display: 'var(--ds-font-display)',
  body: 'var(--ds-font-body)',
  mono: 'var(--ds-font-mono)',
  pixel: 'var(--ds-font-pixel)',
} as const;

/**
 * Default emphasis per heading level, so a document's colour hierarchy follows
 * its structural hierarchy without every call site restating it.
 */
export const HEADING_EMPHASIS: Record<1 | 2 | 3 | 4 | 5 | 6, Emphasis> = {
  1: 'primary',
  2: 'primary',
  3: 'secondary',
  4: 'tertiary',
  5: 'quiet',
  6: 'quiet',
};

/**
 * The full semantic token surface, as CSS variable expressions. Useful for
 * inline styles and for consumers building their own components on the system.
 */
export const semanticTokens = {
  accent: EMPHASIS_VARS,
  intent: INTENT_VARS,
  surface: SURFACE_VARS,
  text: TEXT_VARS,
  border: BORDER_VARS,
  syntax: SYNTAX_VARS,
  font: fontVar,
  shadowColor: 'var(--ds-shadow-color)',
} as const;
