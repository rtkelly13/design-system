#!/usr/bin/env node
/**
 * Fail the build when any level's role pair falls below its minimum ratio.
 *
 * This is the gate that makes a four-rung ladder maintainable. Every colour in
 * `levels.ts` is a literal, so the whole matrix — 4 levels x every text, accent,
 * intent and border against every surface — is computable as data, with no
 * browser and no screenshot. The alternative is reviewing sixty combinations by
 * eye on every palette change, which nobody does twice.
 *
 *   node scripts/check-contrast.mjs            fail on violations
 *   node scripts/check-contrast.mjs --report   print the full matrix, always exit 0
 */

import { auditContrast } from '../src/theme/contrast.ts';
import { LEVELS, THEME_LEVELS } from '../src/theme/levels.ts';

const report = process.argv.includes('--report');
const results = auditContrast(LEVELS);
const failures = results.filter((r) => !r.passes);

const fmt = (r) =>
  `${r.ratio.toFixed(2).padStart(5)}:1  (min ${r.minimum})  ${r.pair}  ${r.foreground} on ${r.background}`;

if (report) {
  for (const level of THEME_LEVELS) {
    const forLevel = results.filter((r) => r.level === level);
    const worst = Math.min(...forLevel.map((r) => r.ratio));
    console.log(`\n${level}  —  ${forLevel.length} pairs, worst ${worst.toFixed(2)}:1`);
    for (const r of [...forLevel].sort((a, b) => a.ratio - b.ratio)) {
      console.log(`  ${r.passes ? ' ' : '!'} ${fmt(r)}`);
    }
  }
  process.exit(0);
}

if (failures.length > 0) {
  console.error(`Contrast check failed — ${failures.length} of ${results.length} pairs below minimum:\n`);
  for (const level of THEME_LEVELS) {
    const forLevel = failures.filter((r) => r.level === level);
    if (forLevel.length === 0) continue;
    console.error(`  ${level}`);
    for (const r of forLevel.sort((a, b) => a.ratio - b.ratio)) {
      console.error(`    ${fmt(r)}`);
    }
  }
  console.error('\nAdjust the level in src/theme/levels.ts, then run `pnpm tokens:build`.');
  process.exit(1);
}

console.log(
  `Contrast OK — ${results.length} pairs across ${THEME_LEVELS.length} levels, all at or above minimum.`,
);
