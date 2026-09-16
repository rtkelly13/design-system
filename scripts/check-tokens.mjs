#!/usr/bin/env node
/**
 * Count the call sites still addressing a colour by hue rather than by role.
 *
 * `scripts/build-tokens.mjs` has referenced this command since the compat
 * aliases were written — *"`pnpm check:tokens` counts the remaining call sites;
 * this block comes out when that reaches zero"* — and it did not exist. The exit
 * condition for deleting ~30 emitted aliases was therefore unmeasurable, so the
 * block sat there indefinitely. This is that command.
 *
 * A ratchet, not a ban, in the same family as `check:css` and `check:deps`. The
 * budget only ever goes down; a new hue-named call site fails the build with the
 * role it should have used.
 *
 *   node scripts/check-tokens.mjs           fail if the count rises
 *   node scripts/check-tokens.mjs --list    print every site
 *
 * ## What counts, and why the mapping is what it is
 *
 * `LegacyAccent` is `'cyan' | 'pink' | 'yellow' | 'green'`, and `LEGACY_VARS`
 * resolves each onto a *role* variable rather than onto its own hue. That is
 * not an accident to be corrected: when those call sites were written there was
 * no hue vocabulary, so `accent="cyan"` could only have meant "the primary
 * accent, which happens to be cyan". Repointing them at `palette.cyan` would
 * change what they render.
 *
 * It matters because the names are already lying on the light level. `palette`
 * exists now, and on `sketch`:
 *
 *   accent="cyan"    renders #1450d7   palette.cyan   is #006675
 *   accent="yellow"  renders #006b2e   palette.yellow is #705a00
 *   accent="pink"    renders #bd0010   palette.pink   is #b4006c
 *
 * So a component asking for cyan gets blue, one asking for yellow gets green,
 * and one asking for pink gets red. Migrating to the role name makes the code
 * say what it does; migrating to the hue token would make it render something
 * else. Both are defensible and only one is a refactor.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');

/**
 * The budget. Lower it in the same commit that removes a site; never raise it.
 * At zero, `compatAliases()` in build-tokens.mjs comes out and so does this
 * file.
 */
const BUDGET = 0;

/** Hue name -> the role that name already resolves to, per `LEGACY_VARS`. */
const REPLACEMENT = {
  cyan: 'primary',
  yellow: 'secondary',
  pink: 'tertiary',
  green: 'success',
};
const HUES = new Set(Object.keys(REPLACEMENT));
const TARGET_PROPS = new Set(['accent', 'variant', 'tone']);

/** A Tailwind utility naming the compat palette. */
const UTILITY = /\b(?:bg|text|border|shadow)-brutalist-[a-zA-Z]+/g;

/**
 * Files that define the deprecation rather than use it. `theme.ts` declares
 * `LegacyAccent` and `LEGACY_VARS`; `contrast.ts` and the generator name the
 * hues structurally. Excluding them keeps the count a measure of *callers*.
 */
const DEFINITIONS = new Set([
  'lib/theme.ts',
  'theme/contrast.ts',
  'theme/levels.ts',
  'lib/accentClasses.ts',
]);

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

const sites = [];
for (const file of walk(SRC)) {
  if (!/\.tsx?$/.test(file)) continue;
  const rel = path.relative(SRC, file);
  if (DEFINITIONS.has(rel)) continue;
  // Tests asserting the deprecated behaviour are keeping a promise, not making
  // one. They come out with the alias, not before it.
  if (/\.test\.tsx?$/.test(rel)) continue;

  const text = readFileSync(file, 'utf8');
  const sourceFile = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  function getLine(node) {
    return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
  }

  function visit(node) {
    // 1. JSX attribute: accent="cyan", variant="pink", tone="yellow"
    if (ts.isJsxAttribute(node) && ts.isIdentifier(node.name) && TARGET_PROPS.has(node.name.text)) {
      let val = null;
      if (node.initializer) {
        if (ts.isStringLiteral(node.initializer)) {
          val = node.initializer.text;
        } else if (
          ts.isJsxExpression(node.initializer) &&
          node.initializer.expression &&
          ts.isStringLiteral(node.initializer.expression)
        ) {
          val = node.initializer.expression.text;
        }
      }
      if (val && HUES.has(val)) {
        sites.push({
          file: rel,
          line: getLine(node),
          match: node.getText(sourceFile).trim(),
          fix: `use "${REPLACEMENT[val]}"`,
        });
      }
    }

    // 2. Object literal property assignment: { accent: 'cyan', variant: 'pink' }
    if (ts.isPropertyAssignment(node)) {
      const propName =
        ts.isIdentifier(node.name) || ts.isStringLiteral(node.name) ? node.name.text : null;
      if (propName && TARGET_PROPS.has(propName)) {
        if (ts.isStringLiteral(node.initializer) && HUES.has(node.initializer.text)) {
          const val = node.initializer.text;
          sites.push({
            file: rel,
            line: getLine(node),
            match: node.getText(sourceFile).trim(),
            fix: `use "${REPLACEMENT[val]}"`,
          });
        }
      }
    }

    // 3. Binary comparison: tier.accent === 'pink', accent == 'cyan', etc.
    if (ts.isBinaryExpression(node)) {
      const op = node.operatorToken.kind;
      if (
        op === ts.SyntaxKind.EqualsEqualsToken ||
        op === ts.SyntaxKind.EqualsEqualsEqualsToken ||
        op === ts.SyntaxKind.ExclamationEqualsToken ||
        op === ts.SyntaxKind.ExclamationEqualsEqualsToken
      ) {
        let hue = null;
        if (ts.isStringLiteral(node.right) && HUES.has(node.right.text)) {
          hue = node.right.text;
        } else if (ts.isStringLiteral(node.left) && HUES.has(node.left.text)) {
          hue = node.left.text;
        }
        if (hue) {
          sites.push({
            file: rel,
            line: getLine(node),
            match: node.getText(sourceFile).trim(),
            fix: `use "${REPLACEMENT[hue]}"`,
          });
        }
      }
    }

    // 4. Tailwind utility classes naming legacy hues: bg-brutalist-cyan, etc.
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    ) {
      UTILITY.lastIndex = 0;
      let m;
      while ((m = UTILITY.exec(node.text)) !== null) {
        sites.push({
          file: rel,
          line: getLine(node),
          match: m[0].trim(),
          fix: 'use a role token',
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

if (process.argv.includes('--list')) {
  for (const s of sites) {
    console.log(`  ${s.file}:${s.line}  ${s.match.padEnd(28)} ${s.fix}`);
  }
  console.log(`\n${sites.length} site(s), budget ${BUDGET}.`);
  process.exit(0);
}

if (sites.length > BUDGET) {
  console.error(`Hue-named call sites: ${sites.length}, budget ${BUDGET}.\n`);
  for (const s of sites) {
    console.error(`  ${s.file}:${s.line}  ${s.match.padEnd(28)} ${s.fix}`);
  }
  console.error(
    '\nA colour is addressed by its job, not its appearance — see docs/adr/0001-hues-declared-below-roles.md.',
  );
  console.error('These names also mislead: on `sketch`, "cyan" renders blue and "pink" renders red.');
  console.error('Run `pnpm check:tokens --list` for the full set.');
  process.exit(1);
}

console.log(
  sites.length === 0
    ? 'No hue-named call sites.'
    : `Hue-named call sites: ${sites.length}, within budget ${BUDGET}.`,
);
