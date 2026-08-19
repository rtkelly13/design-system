#!/usr/bin/env node
/**
 * Count the component code still addressing colours instead of roles.
 *
 * AGENTS.md has said "hardcoded hex literals are forbidden" for a while and
 * nothing has ever checked it — the repo has no linter at all — so the rule was
 * true of the docs layer and false of every primitive. This is the check.
 *
 * It is a ratchet, not a cliff. `BUDGET` below is the count at the time the
 * theme ladder landed; CI fails if a number goes UP, so the migration can
 * proceed file by file while new code is held to the rule immediately. Lower a
 * budget line as you clear a category, and delete it when it reaches zero.
 *
 * The eventual home for this is an ESLint rule. It lives here for now because
 * the repo has no ESLint config, and a check that runs today beats a check that
 * arrives with 200 transitive dependencies.
 *
 *   node scripts/check-tokens.mjs           fail if any category exceeds budget
 *   node scripts/check-tokens.mjs --list    show every offending line
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCAN = [path.join(ROOT, 'src', 'components'), path.join(ROOT, 'src', 'stories')];

/**
 * Each rule is one way of naming a colour instead of a role.
 *
 * `hex` and `rawPalette` are the two that actually break a level: a literal
 * cannot follow the ladder, so it renders identically on `midnight` and
 * `white`. `legacyAlias` is less urgent — those names still resolve, through
 * the deprecated compat block in theme.css — but the block cannot be removed
 * while they exist. `darkVariant` is the one that stops making sense entirely
 * at four levels.
 */
const RULES = [
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

/**
 * Counts at the commit that introduced the ladder, less what the Input, Modal,
 * DataTable, Pagination and PageHeader migrations cleared. Every remaining one is pre-existing debt in components
 * written before the semantic layer existed; `src/prose.css` and the docs
 * chrome are already at zero, and `Input.tsx` is the worked example of what
 * clearing a file looks like.
 */
const BUDGET = {
  hex: 105,
  rawPalette: 32,
  legacyAlias: 73,
  darkVariant: 0,
};

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(tsx?|css)$/.test(entry)) out.push(full);
  }
  return out;
}

const files = SCAN.flatMap((dir) => walk(dir)).sort();
const findings = new Map(RULES.map((rule) => [rule.id, []]));

for (const file of files) {
  const source = readFileSync(file, 'utf8');
  const lines = source.split('\n');
  for (const rule of RULES) {
    lines.forEach((line, index) => {
      // Comment lines describe the rules as often as they break them.
      const trimmed = line.trim();
      if (trimmed.startsWith('*') || trimmed.startsWith('//')) return;
      const matches = line.match(rule.pattern);
      if (!matches) return;
      for (const match of matches) {
        findings.get(rule.id).push({
          file: path.relative(ROOT, file),
          line: index + 1,
          match,
          text: trimmed,
        });
      }
    });
  }
}

const list = process.argv.includes('--list');
let failed = false;

console.log('Token hygiene — components and stories\n');

for (const rule of RULES) {
  const found = findings.get(rule.id);
  const budget = BUDGET[rule.id] ?? 0;
  const over = found.length > budget;
  if (over) failed = true;

  const status = over ? 'OVER' : found.length < budget ? 'DOWN' : ' OK ';
  console.log(
    `  [${status}] ${rule.label.padEnd(38)} ${String(found.length).padStart(4)} / ${budget}`,
  );

  if (list && found.length > 0) {
    const byFile = new Map();
    for (const f of found) byFile.set(f.file, (byFile.get(f.file) ?? 0) + 1);
    for (const [file, count] of [...byFile].sort((a, b) => b[1] - a[1])) {
      console.log(`         ${String(count).padStart(3)}  ${file}`);
    }
  }
  if (over) console.log(`         ${rule.fix}`);
}

const total = RULES.reduce((sum, rule) => sum + findings.get(rule.id).length, 0);
const budgetTotal = Object.values(BUDGET).reduce((a, b) => a + b, 0);
console.log(`\n  ${total} total, budget ${budgetTotal}.`);

if (failed) {
  console.error('\nToken hygiene regressed. New code must use semantic roles.');
  process.exit(1);
}

if (total < budgetTotal) {
  console.log(`  ${budgetTotal - total} below budget — lower BUDGET in scripts/check-tokens.mjs.`);
}
