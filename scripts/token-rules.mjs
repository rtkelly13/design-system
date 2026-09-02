/**
 * What counts as naming a colour instead of a role.
 *
 * One definition, one consumer today: `eslint.config.mjs` reports these at the
 * exact site while you type. There were two until the lint rule replaced the
 * `check-tokens.mjs` ratchet, whose text-regex counted matches inside comments
 * and regexes and so could never reach zero.
 *
 * The file stays separate anyway. These rules are data worth reading on their
 * own, and the next consumer — a codemod, a report — must not mean writing the
 * regexes a second time. Two copies disagreeing about what a violation is, at
 * some remove from each other, is the mistake this file was extracted to fix.
 *
 * The `fix` line is not decoration — it is what the editor shows, so it has to
 * say which role to reach for rather than just that something is wrong.
 *
 * Each rule is one way of naming a colour instead of a role.
 *
 * `hex` and `rawPalette` are the two that actually break a level: a literal
 * cannot follow the ladder, so it renders identically on `midnight` and
 * `white`. `legacyAlias` is less urgent — those names still resolve, through
 * the deprecated compat block in theme.css — but the block cannot be removed
 * while they exist. `darkVariant` is the one that stops making sense entirely
 * at four levels.
 */
export const TOKEN_RULES = [
  {
    id: 'hex',
    label: 'Hex literals',
    pattern: /#[0-9a-fA-F]{3,8}\b/g,
    fix: 'Use a --ds-* token or a semantic utility (bg-surface-raised, text-accent-primary).',
  },
  {
    id: 'rawPalette',
    label: 'Literal Tailwind palette utilities',
    pattern:
      /\b(?:bg|text|border|divide|placeholder|ring|from|to|via)-(?:white|black|zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-\d{2,3})?(?:\/\d{1,3})?\b/g,
    fix: 'Use the semantic utilities: bg-surface-*, text-content-*, border-edge-*, text-intent-*.',
  },
  {
    id: 'legacyAlias',
    label: 'Legacy brutalist-* colour aliases',
    // `brutalist-card` / `-btn` / `-badge` are component classes in styles.css,
    // already written against roles — they are not colour names and stay.
    pattern: /\bbrutalist-(?:cyan|neonCyan|pink|yellow|neonGreen|green|cyberOrange|darkBg|shadow-color)\b/g,
    fix: 'Use accent-*/intent-* utilities or --ds-* tokens. Blocks removing the compat block in theme.css.',
  },
  {
    id: 'darkVariant',
    label: 'dark: colour variants',
    pattern: /\bdark:(?:bg|text|border|divide|placeholder|ring|from|to|via)-/g,
    fix: 'Tokens switch on their own. dark: is only for non-colour utilities, and means "midnight or dim" now.',
  },
];
