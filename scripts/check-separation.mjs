#!/usr/bin/env node
/**
 * Fail the build when two syntax roles that sit next to each other in real code
 * are not far enough apart in luminance to be told apart.
 *
 * The companion to `check-contrast.mjs`, and not a substitute for it. Contrast
 * asks whether a token reads against its background; this asks whether it reads
 * against its *neighbour*. Two colours can both clear AA and still be the same
 * grey once a 1px stroke has been through 4:2:0 chroma subsampling — which is
 * what happens the first time a code surface is rendered to video.
 *
 * The pair list is measured rather than assumed; see `ADJACENT_PAIRS`.
 *
 *   node scripts/check-separation.mjs            fail on violations
 *   node scripts/check-separation.mjs --report   print the full matrix, always exit 0
 */

import { auditSeparation } from '../src/theme/separation.ts';
import { LEVELS, THEME_LEVELS } from '../src/theme/levels.ts';

const report = process.argv.includes('--report');
const results = auditSeparation(LEVELS);
const failures = results.filter((r) => !r.passes);

const fmt = (r) =>
  `${r.delta.toFixed(1).padStart(5)}  (min ${r.minimum})  ${r.pair}  ${r.a} / ${r.b}`;

if (report) {
  for (const level of THEME_LEVELS) {
    const forLevel = results.filter((r) => r.level === level);
    const worst = Math.min(...forLevel.map((r) => r.delta));
    console.log(`\n${level}  —  ${forLevel.length} adjacent pairs, tightest ${worst.toFixed(1)}`);
    for (const r of [...forLevel].sort((a, b) => a.delta - b.delta)) {
      console.log(`  ${r.passes ? ' ' : '!'} ${fmt(r)}`);
    }
  }
  process.exit(0);
}

if (failures.length > 0) {
  console.error(
    `Separation check failed — ${failures.length} of ${results.length} adjacent pairs too close:\n`,
  );
  for (const level of THEME_LEVELS) {
    const forLevel = failures.filter((r) => r.level === level);
    if (forLevel.length === 0) continue;
    console.error(`  ${level}`);
    for (const r of forLevel.sort((a, b) => a.delta - b.delta)) {
      console.error(`    ${fmt(r)}`);
    }
  }
  console.error(
    '\nLuma separation is what survives chroma subsampling and colour-blindness.',
  );
  console.error('Move one of the pair along the light/dark axis, not around the hue wheel.');
  process.exit(1);
}

const tightest = Math.min(...results.map((r) => r.delta));
console.log(
  `Separation OK — ${results.length} adjacent pairs across ${THEME_LEVELS.length} levels, tightest ${tightest.toFixed(1)}.`,
);
