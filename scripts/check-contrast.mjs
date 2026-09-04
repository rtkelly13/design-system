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

import { auditContrast, auditSelectionDevices } from '../src/theme/contrast.ts';
import { LEVELS, THEME_LEVELS } from '../src/theme/levels.ts';

const report = process.argv.includes('--report');
const results = auditContrast(LEVELS);
const failures = results.filter((r) => !r.passes);

// The state rule: a selected tab is marked with an accent fill or edge, never
// with one surface against another. The devices must clear 3:1 on every level;
// the surface pairs are printed so the reason they are not a device is in the
// output, not in someone's memory.
const devices = auditSelectionDevices(LEVELS);
const deviceFailures = devices.filter((r) => r.device !== 'surface pair' && !r.passes);
const surfacePairs = devices.filter((r) => r.device === 'surface pair');
const surfacePairPasses = surfacePairs.filter((r) => r.passes);

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
  console.log('\nselection devices — fill / edge must clear 3:1 on every level');
  for (const level of THEME_LEVELS) {
    const forLevel = devices.filter((r) => r.level === level && r.device !== 'surface pair');
    const worst = Math.min(...forLevel.map((r) => r.ratio));
    console.log(`  ${level}  worst ${worst.toFixed(2)}:1`);
  }
  console.log('\nsurface pairs — NOT a selection device (shown so nobody has to rediscover why)');
  for (const r of surfacePairs) {
    console.log(`  ${r.passes ? '!' : ' '} ${r.level.padEnd(9)} ${fmt(r)}`);
  }
  process.exit(0);
}

if (deviceFailures.length > 0) {
  console.error(
    `Selection-device check failed — ${deviceFailures.length} fill/edge pairs below ${deviceFailures[0].minimum}:1:\n`,
  );
  for (const r of deviceFailures.sort((a, b) => a.ratio - b.ratio)) {
    console.error(`  ${r.level.padEnd(9)} ${fmt(r)}`);
  }
  console.error('\nA selected tab marked with this accent would not read on that level.');
  process.exit(1);
}

if (surfacePairPasses.length > 0) {
  // Not a failure: a wider surface ramp is a legitimate design change. But it is
  // the one condition under which a surface-pair widget passes review on one
  // rung and disappears on another, so it is said out loud.
  console.warn('Note — a surface pair clears 3:1 on some level. Surfaces are for layering, not state;');
  console.warn('a component marking selection with them will read here and vanish on the others:');
  for (const r of surfacePairPasses) console.warn(`  ${r.level.padEnd(9)} ${fmt(r)}`);
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
  `Contrast OK — ${results.length} pairs across ${THEME_LEVELS.length} levels, all at or above minimum; ` +
    `${devices.length - surfacePairs.length} selection devices clear ${devices[0].minimum}:1.`,
);
