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
 * The rules themselves are in `src/lib/tokenRules.ts`, because `ds-report` runs
 * the same ones over a report's TSX — at budget zero, since a report is new code
 * with no debt to grandfather. This file owns the budgets and the reporting; it
 * does not own the regexes, so the two can never drift apart.
 *
 *   node scripts/check-tokens.mjs           fail if any category exceeds budget
 *   node scripts/check-tokens.mjs --list    show every offending line
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// A `.ts` import from a plain `.mjs` script: Node strips the types. That is what
// lets the rules be shared with `src/report/lint.ts` rather than copied.
import { TOKEN_RULES, scanTokenRules } from '../src/lib/tokenRules.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCAN = [path.join(ROOT, 'src', 'components'), path.join(ROOT, 'src', 'stories')];

/**
 * Counts at the commit that introduced the ladder, less what the Input, Modal,
 * DataTable, Pagination, PageHeader and StatCard migrations cleared. Every remaining one is pre-existing debt in components
 * written before the semantic layer existed; `src/prose.css` and the docs
 * chrome are already at zero, and `Input.tsx` is the worked example of what
 * clearing a file looks like.
 */
const BUDGET = {
  hex: 105,
  rawPalette: 31,
  legacyAlias: 64,
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
const findings = new Map(TOKEN_RULES.map((rule) => [rule.id, []]));

for (const file of files) {
  for (const finding of scanTokenRules(readFileSync(file, 'utf8'))) {
    findings.get(finding.ruleId).push({ ...finding, file: path.relative(ROOT, file) });
  }
}

const list = process.argv.includes('--list');
let failed = false;

console.log('Token hygiene — components and stories\n');

for (const rule of TOKEN_RULES) {
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

const total = TOKEN_RULES.reduce((sum, rule) => sum + findings.get(rule.id).length, 0);
const budgetTotal = Object.values(BUDGET).reduce((a, b) => a + b, 0);
console.log(`\n  ${total} total, budget ${budgetTotal}.`);

if (failed) {
  console.error('\nToken hygiene regressed. New code must use semantic roles.');
  process.exit(1);
}

if (total < budgetTotal) {
  console.log(`  ${budgetTotal - total} below budget — lower BUDGET in scripts/check-tokens.mjs.`);
}
