#!/usr/bin/env node
/**
 * Every package this one installs or ships carries a licence we can distribute
 * under MIT, and no licence changes without someone saying so.
 *
 * `check-deps.mjs` already asks whether a dependency is *justified*. It says
 * nothing about its *terms*, and it only looks at the six direct entries in
 * `package.json` — while the licence risk is transitive and currently 378
 * packages deep. Those are different questions and neither answers the other.
 *
 * The failure this exists for is not "someone adds a GPL dependency". That is
 * loud, rare, and a reviewer would catch it. It is that **a package already in
 * the tree changes its licence in a later version**, which has happened to most
 * of the industry at least once — Redis, Terraform, Sentry, Elasticsearch and
 * MongoDB all relicensed to BUSL/SSPL/Elastic terms in a *minor or major bump*,
 * not a rename. Nothing in a lockfile diff says "this is no longer MIT". `pnpm
 * update` pulls it in, the build stays green, and the package is republished to
 * public npm under a licence that no longer permits it.
 *
 * So the licence of every package is recorded in `licenses.baseline.json` and
 * compared on every run. A version bump that keeps its licence is silent; a
 * licence *change* fails, whether or not the new licence is one we'd otherwise
 * allow — because a move from MIT to Apache-2.0 is harmless but adds a NOTICE
 * obligation, and one from MIT to BUSL is not harmless at all. The baseline diff
 * in the PR is the audit trail: "this bump added 14 packages, all MIT" is a
 * reviewable sentence.
 *
 * Two scopes, because they carry different obligations:
 *
 *   shipped — `--prod`: runtime and peer dependencies. A consumer installs
 *             these, so their terms have to be compatible with redistributing
 *             this package under MIT. Strict allowlist.
 *   dev     — everything else. Build and test tooling, never installed by a
 *             consumer and never present in `dist`, so file-level copyleft is
 *             fine here and only genuinely viral or commercial terms are not.
 *
 * The distribution check is separate and reads `dist/`, so this must run
 * **after `pnpm build`**. It fails when `dist/` is missing rather than skipping,
 * because a check that quietly passes when its input is absent is worse than no
 * check — see the "No Preview" baselines in AGENTS.md rule 5 for the version of
 * that mistake this repo has already made.
 *
 *   node scripts/check-licenses.mjs           verify
 *   node scripts/check-licenses.mjs --list    print the table for review
 *   node scripts/check-licenses.mjs --update  re-record the baseline
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE = path.join(ROOT, 'licenses.baseline.json');

const listing = process.argv.includes('--list');
const updating = process.argv.includes('--update');

/**
 * Licences a package may carry and still be installed by a consumer of this
 * one. Default-deny: a licence absent from this map fails, so a new SPDX id
 * arriving in the tree is a decision someone makes on purpose.
 *
 * The note is the obligation, not a description — it is what a reader needs in
 * order to know whether the entry is still correct.
 */
const SHIPPED = {
  'MIT': 'Notice must accompany copies. Nothing is bundled into dist, so the consumer receives each package with its own notice intact.',
  'ISC': 'Functionally MIT; same notice requirement, same reasoning.',
  'Apache-2.0': 'Adds a patent grant and NOTICE propagation. Safe to depend on; would need a NOTICE file if we ever bundled one into dist.',
  'BSD-2-Clause': 'Notice-only, no advertising clause.',
  'BSD-3-Clause': 'Notice plus a no-endorsement clause we do not trip by depending on it.',
  '0BSD': 'Public-domain-equivalent, no notice required.',
  'MIT-0': 'MIT without the attribution requirement.',
  'CC0-1.0': 'Copyright waiver. Not ideal for software (no patent grant) but imposes nothing.',
  'BlueOak-1.0.0': 'Permissive, plain-language, with an explicit patent grant. No copyleft.',
  'OFL-1.1': 'Fonts. Redistribution is permitted, but OFL §5 requires the font software stay under OFL and forbids relicensing it — which is what shipping it inside an MIT package would do. Safe here only because the .woff2 files never enter dist, and the dist font check below is what keeps that true.',
};

/**
 * Additionally allowed for build and test tooling. Each of these would need a
 * real decision before it could move into the shipped scope, which is why the
 * scope escalation check below exists.
 */
const DEV_ONLY = {
  'MPL-2.0': 'File-level copyleft: triggers only on distributing a modified MPL file. We consume these as build tools and modify nothing, and they are absent from dist.',
  'CC-BY-4.0': 'Attribution required for the data, not for a build that reads it. Never redistributed here.',
  'Python-2.0': 'Permissive, GPL-compatible. Appears only via tooling.',
  'Unlicense': 'Public domain dedication.',
};

/**
 * Packages whose recorded licence differs from what its own metadata claims, or
 * that need a note a future reader would otherwise have to reconstruct.
 *
 * An entry has to still match a package in the tree to stay valid, which is
 * what stops this becoming a place to silence the check.
 */
const NOTES = {
  'caniuse-lite': 'CC-BY-4.0 covers the browser support *data*, not code. Build-time only, via Tailwind’s autoprefixing.',
  'lightningcss': 'MPL-2.0, reached through Tailwind v4’s CSS pipeline. Build-time only — it never appears in dist, and we do not modify it.',
};

const problems = [];

/**
 * `pnpm licenses list` for one scope.
 *
 * This reads a subprocess whose failure mode is a JSON body rather than an
 * empty one: a corrupt store index makes pnpm exit 1 and print
 * `{"error": {...}}` on stdout. Parsed naively that is an object with no
 * licence keys, i.e. "zero packages, nothing to complain about" — a silent pass
 * on an unreadable tree. Both that and an implausibly empty result are hard
 * failures.
 */
function licensesFor(scope) {
  const args = ['licenses', 'list', '--json'];
  if (scope === 'shipped') args.push('--prod');

  let raw;
  try {
    raw = execFileSync('pnpm', args, {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (error) {
    // pnpm writes the error object to stdout and exits non-zero.
    raw = error.stdout ?? '';
    if (!raw.trim()) {
      throw new Error(
        `\`pnpm ${args.join(' ')}\` failed and produced no output: ${error.message}`,
      );
    }
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`\`pnpm ${args.join(' ')}\` did not return JSON:\n${raw.slice(0, 400)}`);
  }

  if (data.error) {
    throw new Error(
      `pnpm could not read the dependency tree (${data.error.code}): ${data.error.message}\n` +
        `  Nothing was verified. Run \`pnpm install\` and try again.`,
    );
  }

  const found = new Map();
  for (const [license, packages] of Object.entries(data)) {
    for (const entry of packages) found.set(entry.name, license);
  }

  // This package has dependencies. An empty answer means we asked wrongly, not
  // that the tree is clean.
  if (found.size === 0) {
    throw new Error(
      `\`pnpm ${args.join(' ')}\` reported zero packages. That cannot be right — ` +
        `treat it as a broken read, not a pass.`,
    );
  }

  return found;
}

/** Font binaries inside `dist/`, which OFL §5 and the MIT LICENSE disagree about. */
function distributedFonts() {
  const dist = path.join(ROOT, 'dist');
  if (!existsSync(dist)) return null;

  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.(woff2?|ttf|otf|eot)$/i.test(entry)) out.push(path.relative(ROOT, full));
    }
  };
  walk(dist);
  return out;
}

// ---------------------------------------------------------------------------

let shipped;
let everything;
try {
  shipped = licensesFor('shipped');
  everything = licensesFor('all');
} catch (error) {
  console.error(`\nLicence check could not run:\n\n  - ${error.message}\n`);
  process.exit(1);
}

/** name -> { license, scope }, the shape the baseline records. */
const current = new Map();
for (const [name, license] of everything) {
  current.set(name, { license, scope: shipped.has(name) ? 'shipped' : 'dev' });
}
// A package can appear in --prod and not in the full listing when pnpm resolves
// a peer differently between the two; record it rather than lose it.
for (const [name, license] of shipped) {
  if (!current.has(name)) current.set(name, { license, scope: 'shipped' });
}

const sorted = [...current.entries()].sort(([a], [b]) => a.localeCompare(b));

if (updating) {
  const packages = {};
  for (const [name, record] of sorted) packages[name] = record;
  writeFileSync(
    BASELINE,
    `${JSON.stringify(
      {
        $comment:
          'Recorded licence of every package in the tree, checked by scripts/check-licenses.mjs. ' +
          'Regenerate with `pnpm licenses:update` and review the diff — a changed licence is the ' +
          'thing this file exists to make visible.',
        packages,
      },
      null,
      2,
    )}\n`,
  );
  console.log(
    `Baseline re-recorded — ${sorted.length} packages ` +
      `(${shipped.size} shipped, ${sorted.length - shipped.size} dev). Review the diff before committing.`,
  );
  process.exit(0);
}

if (!existsSync(BASELINE)) {
  console.error(
    `\n${path.relative(ROOT, BASELINE)} does not exist, so there is nothing to compare against.\n` +
      `  Run \`pnpm licenses:update\` to record the current tree, then commit it.\n`,
  );
  process.exit(1);
}

let baseline;
try {
  baseline = JSON.parse(readFileSync(BASELINE, 'utf8')).packages ?? {};
} catch (error) {
  console.error(`\n${path.relative(ROOT, BASELINE)} is unparseable: ${error.message}\n`);
  process.exit(1);
}

// 1. Every licence must be allowed in the scope it appears in. Default-deny.
for (const [name, { license, scope }] of sorted) {
  const permitted = scope === 'shipped' ? SHIPPED : { ...SHIPPED, ...DEV_ONLY };
  if (license in permitted) continue;

  problems.push(
    scope === 'shipped'
      ? `${name}: "${license}" is not an allowed licence for a shipped dependency. ` +
        `A consumer installs this package, so its terms have to permit redistribution ` +
        `under our MIT licence. Either replace the dependency, move it to a ` +
        `devDependency if it is only build tooling, or — if the licence really is ` +
        `compatible — add it to SHIPPED in this script with the obligation it carries.`
      : `${name}: "${license}" is not an allowed licence, even for tooling. ` +
        `Add it to DEV_ONLY with a reason if it is safe at build time, or replace it.`,
  );
}

// 2. Licence drift. The reason this file exists: same package, different terms.
for (const [name, { license, scope }] of sorted) {
  const was = baseline[name];
  if (!was) continue;
  if (was.license !== license) {
    problems.push(
      `${name}: licence changed from "${was.license}" to "${license}". ` +
        `This is the case the baseline exists to catch — a package relicensing under ` +
        `a version bump. Confirm the new terms are acceptable (check the package's ` +
        `own repository, not just the metadata), then run \`pnpm licenses:update\`.`,
    );
  }
  // 3. Scope escalation: build-time terms are only safe while they stay build-time.
  if (was.scope === 'dev' && scope === 'shipped') {
    problems.push(
      `${name}: moved from a dev dependency to a shipped one, and its licence ` +
        `("${license}") was only ever cleared for build-time use. A consumer now ` +
        `installs it. Re-check the terms before running \`pnpm licenses:update\`.`,
    );
  }
}

// 4. Packages arriving or leaving. New ones fail: the point is that the set is
//    reviewed, and the baseline diff is where that review happens.
for (const [name, { license, scope }] of sorted) {
  if (!baseline[name]) {
    problems.push(
      `${name}: new in the tree ("${license}", ${scope}) and absent from the baseline. ` +
        `Run \`pnpm licenses:update\` and review the diff.`,
    );
  }
}
for (const name of Object.keys(baseline)) {
  if (!current.has(name)) {
    problems.push(
      `${name}: in the baseline but no longer in the tree. Run \`pnpm licenses:update\` to drop it.`,
    );
  }
}

// 5. No font binary may enter dist. OFL §5 requires the font software stay
//    under OFL and forbids relicensing it; our LICENSE says the package is MIT.
//    Bundling a .woff2 puts those two in direct conflict, and it would happen
//    through a build-config change nothing else here looks at.
const fonts = distributedFonts();
if (fonts === null) {
  problems.push(
    'dist/ does not exist, so the distribution half of this check verified nothing. ' +
      'Run `pnpm build` first — in CI this step must follow the build.',
  );
} else if (fonts.length > 0) {
  problems.push(
    `dist/ contains ${fonts.length} font file(s): ${fonts.slice(0, 4).join(', ')}` +
      `${fonts.length > 4 ? ', …' : ''}. The @fontsource packages are OFL-1.1, and OFL §5 ` +
      `requires the font software be distributed under OFL rather than relicensed — which ` +
      `is what shipping it inside this MIT package would do. Fonts must stay bare ` +
      `\`@import\` specifiers in styles.css so the consumer resolves them from their own ` +
      `install. If they genuinely need to ship, the fonts need their own OFL notice in ` +
      `dist and a carve-out in LICENSE.`,
  );
}

// 6. Every note must still describe a package that is here.
for (const name of Object.keys(NOTES)) {
  if (!current.has(name)) {
    problems.push(`${name}: has a NOTES entry but is not in the tree. Remove the entry.`);
  }
}

if (listing) {
  const counts = new Map();
  for (const [, { license }] of sorted) counts.set(license, (counts.get(license) ?? 0) + 1);

  console.log('| Licence | Count | Scope | Obligation |');
  console.log('|---|---|---|---|');
  for (const [license, count] of [...counts].sort((a, b) => b[1] - a[1])) {
    const where = license in SHIPPED ? 'shipped + dev' : license in DEV_ONLY ? 'dev only' : '**NOT ALLOWED**';
    const note = SHIPPED[license] ?? DEV_ONLY[license] ?? '—';
    console.log(`| \`${license}\` | ${count} | ${where} | ${note} |`);
  }
  console.log();

  const notable = sorted.filter(([name]) => name in NOTES);
  if (notable.length > 0) {
    console.log('| Package | Licence | Note |');
    console.log('|---|---|---|');
    for (const [name, { license }] of notable) {
      console.log(`| \`${name}\` | ${license} | ${NOTES[name]} |`);
    }
    console.log();
  }

  console.log(`Shipped dependencies (${shipped.size}) — the set a consumer installs:`);
  for (const [name, license] of [...shipped].sort(([a], [b]) => a.localeCompare(b))) {
    console.log(`  ${license.padEnd(12)} ${name}`);
  }
  console.log();
}

if (problems.length > 0) {
  console.error(`Licence check failed — ${problems.length} problem(s):\n`);
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error(
    '\nA licence that changed is the finding, not the noise. Read what changed before re-recording.\n',
  );
  process.exit(1);
}

const shippedLicences = new Set([...shipped.values()]);
console.log(
  `Licences OK — ${sorted.length} packages match the baseline; ` +
    `${shipped.size} shipped under ${[...shippedLicences].sort().join(', ')}; ` +
    `no font binaries in dist.`,
);
