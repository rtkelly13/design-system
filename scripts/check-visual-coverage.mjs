#!/usr/bin/env node
/**
 * Which stories does the gated visual suite actually assert?
 *
 * `tests/visual.spec.ts` hand-lists the stories it screenshots, so a story can
 * be added, reviewed and merged without ever being asserted — and nothing says
 * so. The walkthrough captures everything, but by design asserts nothing, which
 * makes it easy to believe a component is covered when it is only *photographed*.
 *
 * This closes the loop the same way the other checks do: a ratchet. Existing
 * gaps are budgeted and burn down; a NEW story cannot land ungated.
 *
 * Reads Storybook's own build index, so it cannot drift from the real story
 * list, and reads the spec for `?id=…` rather than guessing baseline filenames
 * from story ids — the baselines are hand-named and do not match.
 *
 *   node scripts/check-visual-coverage.mjs           fail if coverage regressed
 *   node scripts/check-visual-coverage.mjs --list    show what is not asserted
 */

import { readFileSync, statSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INDEX = path.join(ROOT, 'storybook-static', 'index.json');
const SPEC = path.join(ROOT, 'tests', 'visual.spec.ts');

/**
 * Stories deliberately left out of the gated suite, each with a reason.
 *
 * A reason beats a number: it forces the question "should this be asserted?" to
 * be answered once, rather than left as an unexplained gap in a budget.
 */
const EXCLUDED = {
  'foundations-theme-ladder--contrast-matrix':
    'Renders the contrast gate’s own numbers. `pnpm check:contrast` already fails CI on any violation, so a pixel diff of the table adds nothing and would churn on every palette tweak.',
  'showcase-designsandbox--default-sandbox':
    'The kitchen sink — every component, several screens tall. Too broad to localise a failure, and it changes whenever anything does.',
};

/** The count of un-triaged, un-asserted stories at the time this check landed. */
const BUDGET = 20;

let index;
try {
  index = JSON.parse(readFileSync(INDEX, 'utf8'));
} catch {
  console.error(
    `Storybook index not found at ${path.relative(ROOT, INDEX)}.\nRun \`pnpm build-storybook\` first — this check reads the real story list.`,
  );
  process.exit(1);
}

// The index is a build artefact, so it is only as fresh as the last
// `build-storybook`. In CI this check always follows the build; locally it is
// easy to read a stale index and be told about a story you just deleted.
try {
  const indexAge = statSync(INDEX).mtimeMs;
  const storyDir = path.join(ROOT, 'src', 'stories');
  const newest = Math.max(
    ...readdirSync(storyDir)
      .filter((f) => f.endsWith('.stories.tsx'))
      .map((f) => statSync(path.join(storyDir, f)).mtimeMs),
  );
  if (newest > indexAge) {
    console.warn(
      'Warning: a story file is newer than storybook-static/index.json.\n         Run `pnpm build-storybook` — this check reads the built index.\n',
    );
  }
} catch {
  // Best-effort freshness hint; never the reason this check fails.
}

const stories = Object.values(index.entries)
  .filter((entry) => entry.type === 'story')
  .map(({ id, title, name }) => ({ id, title, name }));

const spec = readFileSync(SPEC, 'utf8');
const asserted = new Set(
  [...spec.matchAll(/[?&]id=([a-z0-9-]+)/gi)].map((match) => match[1]),
);

const uncovered = stories.filter((s) => !asserted.has(s.id) && !EXCLUDED[s.id]);
const excludedPresent = stories.filter((s) => EXCLUDED[s.id]);

// A reason for a story that no longer exists is stale documentation.
const staleExclusions = Object.keys(EXCLUDED).filter(
  (id) => !stories.some((s) => s.id === id),
);

// An id in the spec that Storybook does not build is a test asserting nothing.
const phantom = [...asserted].filter((id) => !stories.some((s) => s.id === id));

console.log('Visual coverage — stories the gated suite asserts\n');
console.log(`  ${stories.length} stories, ${asserted.size} asserted, ${excludedPresent.length} excluded with a reason.`);
console.log(`  ${uncovered.length} not asserted / budget ${BUDGET}.`);

if (process.argv.includes('--list')) {
  if (uncovered.length > 0) {
    console.log('\n  Not asserted:');
    for (const s of uncovered) console.log(`    ${s.title} / ${s.name}  (${s.id})`);
  }
  if (excludedPresent.length > 0) {
    console.log('\n  Excluded:');
    for (const s of excludedPresent) console.log(`    ${s.id}\n      ${EXCLUDED[s.id]}`);
  }
}

const problems = [];
if (uncovered.length > BUDGET) {
  problems.push(
    `${uncovered.length} stories are not asserted, budget is ${BUDGET}. A new story must either be added to tests/visual.spec.ts — comment \`/update-snapshots\` on the PR first, per AGENTS.md rule 7 — or listed in EXCLUDED with a reason.`,
  );
}
for (const id of staleExclusions) {
  problems.push(`${id}: excluded but no longer exists. Remove it from EXCLUDED.`);
}
for (const id of phantom) {
  problems.push(`${id}: asserted in visual.spec.ts but Storybook builds no such story.`);
}

if (problems.length > 0) {
  console.error('\nVisual coverage check failed:\n');
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

if (uncovered.length < BUDGET) {
  console.log(`  ${BUDGET - uncovered.length} below budget — lower BUDGET in scripts/check-visual-coverage.mjs.`);
}
