#!/usr/bin/env node
/**
 * Assert that the built bundle and assets stay within their byte budgets.
 *
 * A design system is shipped to consumers who pay for every byte in cold-load
 * latency, parsing overhead, and mobile transfer. While `check:api` guards
 * against breaking the public TypeScript contract, nothing previously
 * prevented a heavy dependency from leaking into `dist/` or CSS bloating
 * without notice.
 *
 * This checks the uncompressed (raw) and gzipped sizes of:
 *   - dist/index.mjs  (ESM bundle)
 *   - dist/index.js   (CommonJS bundle)
 *   - src/theme.css   (Generated design token & theme ladder CSS)
 *
 * ## A ratchet, not an arbitrary guess
 *
 * Same architectural ratchet as `check:lint-budget`, `check:css` and
 * `check:component-docs`: the budget captures the baseline on the day this
 * gate landed. Any regression past the ceiling fails CI immediately. When an
 * optimization lands, ratchet the budget down in the same commit.
 *
 *   node scripts/check-bundle-size.mjs           verify
 *   node scripts/check-bundle-size.mjs --list    print current sizes and ceilings
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Ceilings in bytes (raw and gzip).
 * Sized tightly to current build output with a ~2% cushion for compiler metadata.
 *
 * Measured against `main` at the point this gate landed — after the recommended
 * colour exports (#221) and the Base UI dialogs (#253), both of which grew the
 * bundle past the numbers this file was first written with. A budget recorded
 * before the commits it has to admit is a gate that fails on arrival, so these
 * are re-measured rather than inherited.
 *
 * Raised again for the report frame (`ReportDocument`): +118 B raw, +21 B gzip
 * on the ESM bundle for three components. It is tree-shaken away from anyone
 * who does not import it, and `check:dep-cost` confirms it adds no dependency
 * weight at all — it is markup and a recipe over primitives already paid for.
 *
 * ## Record these from CI, not from a laptop
 *
 * gzip is not reproducible across platforms. The same `dist/index.mjs` weighs
 * 50,721 bytes gzipped on macOS and 50,870 on ubuntu-latest — a 149-byte
 * spread that comes from zlib builds rather than from anything in the bundle.
 * Budgets first recorded on a developer machine had enough headroom to hide
 * it; the report frame's +21 B did not, and the gate failed in CI on a tree
 * that passed locally.
 *
 * So the ceilings below are the **runner's** measurements plus roughly half a
 * percent. Re-record from a CI run rather than from `pnpm check:bundle-size`
 * locally, or leave enough cushion to cover the spread. `check:dep-cost` has
 * the same property and absorbs it with a tolerance; this gate is a hard
 * ceiling, so the cushion has to live in the number.
 */
const BUDGETS = {
  'dist/index.mjs': {
    maxRaw: 218_600,
    maxGzip: 51_200,
    desc: 'ESM bundle',
  },
  'dist/index.js': {
    maxRaw: 241_700,
    maxGzip: 53_300,
    desc: 'CommonJS bundle',
  },
  'src/theme.css': {
    maxRaw: 27_000,
    maxGzip: 5_000,
    desc: 'Design token CSS',
  },
};

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(2).padStart(6)} KB (${bytes.toLocaleString('en-US')} B)`;
}

const problems = [];
const rows = [];

for (const [rel, budget] of Object.entries(BUDGETS)) {
  const full = path.join(ROOT, rel);
  if (!existsSync(full)) {
    problems.push(`${rel} does not exist. Run 'pnpm build' first.`);
    continue;
  }

  const content = readFileSync(full);
  const rawSize = content.length;
  const gzipSize = gzipSync(content).length;

  rows.push({
    file: rel,
    desc: budget.desc,
    raw: rawSize,
    maxRaw: budget.maxRaw,
    gzip: gzipSize,
    maxGzip: budget.maxGzip,
  });

  if (rawSize > budget.maxRaw) {
    problems.push(
      `${rel} raw size ${formatBytes(rawSize)} exceeds budget ${formatBytes(budget.maxRaw)} (+${rawSize - budget.maxRaw} B)`,
    );
  }
  if (gzipSize > budget.maxGzip) {
    problems.push(
      `${rel} gzip size ${formatBytes(gzipSize)} exceeds budget ${formatBytes(budget.maxGzip)} (+${gzipSize - budget.maxGzip} B)`,
    );
  }
}

if (process.argv.includes('--list')) {
  console.log('Bundle Size Census:');
  for (const r of rows) {
    console.log(`\n  ${r.file} (${r.desc}):`);
    console.log(`    raw:  ${formatBytes(r.raw)} / max ${formatBytes(r.maxRaw)}`);
    console.log(`    gzip: ${formatBytes(r.gzip)} / max ${formatBytes(r.maxGzip)}`);
  }
  console.log('');
}

if (problems.length) {
  console.error(`\nBundle size budget exceeded — ${problems.length} violation(s):\n`);
  for (const p of problems) console.error(`  - ${p}`);
  console.error(
    '\nBundle bloat directly impacts consumers. If this increase was intentional, ' +
      'justify it and update BUDGETS in scripts/check-bundle-size.mjs.',
  );
  process.exit(1);
}

console.log(
  `Bundle size OK — ${rows.length} assets checked within raw and gzip budgets.`,
);
