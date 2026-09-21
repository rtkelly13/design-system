#!/usr/bin/env node
/**
 * Unlicensed reference artwork stays out of the tree, and its catalogue stays in it.
 *
 * `docs/reference-material.md` states the position plainly: the 57 Book of Shapes
 * SVGs are published under no licence at all, so they are all rights reserved,
 * and nothing in `reference/bookofshapes/svg/` may be committed, bundled or
 * shipped. `.gitignore` carries the rule. That doc also says what this script
 * is: *"If a licence check is ever built, this directory is the reason it would
 * have to read the tree and not just `package.json`."*
 *
 * ## Why an ignore rule was not enough
 *
 * `.gitignore` is advice to `git add`, not a property of the repository. It is
 * silent when someone types `git add -f`, when a tool commits with its own
 * index, and — the case that prompted this — when a branch was cut before the
 * rule existed and still carries the files. A branch on this remote does
 * exactly that: it adds all 57 SVGs plus the generated contact sheet. Merging it
 * would publish all-rights-reserved artwork from a **public** repository, and
 * nothing in CI would have said a word.
 *
 * `check:licences` cannot see this. It reads `package.json` and the installed
 * tree, and this artwork is not a package. That is the gap the doc predicted.
 *
 * ## Both directions
 *
 * A one-sided gate would be half the rule. The artwork must stay out, *and* the
 * catalogue — `manifest.json`, `ATTRIBUTION.md`, the READMEs, the fetch script —
 * must stay in, because that is what keeps the directory browsable and
 * re-fetchable with the artwork absent. Deleting the catalogue to silence a
 * complaint about the artwork would satisfy a one-sided check and lose the
 * attribution, which is the part with an ethical claim on it.
 *
 *   node scripts/check-reference-material.mjs           verify
 *   node scripts/check-reference-material.mjs --list    print what is tracked and what is barred
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { REPO_ROOT } from './repo-root.mjs';

/*
 * The repository root, not the package: `reference/` is shipped by no package
 * — that is the whole point of it — and the `.gitignore` carrying the rule is
 * the repository's. Resolving this against the package would have made the
 * gate pass by looking in a directory where the artwork could never be.
 */
const ROOT = REPO_ROOT;

/**
 * Paths that must never be tracked, and why.
 *
 * Keyed by the `.gitignore` entry that states the rule, so the two cannot drift:
 * the gate asserts each pattern is still ignored as well as still absent.
 */
const BARRED = {
  'reference/bookofshapes/svg/': {
    why: 'All rights reserved — bookofshapes.com publishes no licence. Reference only; ask the author (nikolaj@creasurf.net) before any other use.',
  },
  'reference/bookofshapes/contact-sheet.html': {
    why: 'Generated from the artwork, so it embeds it. Rebuild locally with `python3 reference/bookofshapes/contact_sheet.py`.',
  },
};

/**
 * The catalogue that must remain tracked — what makes the directory legible
 * when the artwork is not there.
 */
const REQUIRED = [
  'reference/bookofshapes/ATTRIBUTION.md',
  'reference/bookofshapes/README.md',
  'reference/bookofshapes/manifest.json',
  'reference/bookofshapes/fetch.py',
];

const git = (...args) =>
  execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);

const tracked = git('ls-files', 'reference');
const ignoreRules = readFileSync(path.join(ROOT, '.gitignore'), 'utf8')
  .split('\n')
  .map((line) => line.trim());

if (process.argv.includes('--list')) {
  console.log('\nTracked under reference/:');
  for (const file of tracked) console.log(`  ${file}`);
  console.log('\nBarred from the tree:');
  for (const [pattern, entry] of Object.entries(BARRED)) {
    console.log(`  ${pattern}\n    ${entry.why}`);
  }
  process.exit(0);
}

const problems = [];

for (const [pattern, entry] of Object.entries(BARRED)) {
  const offenders = tracked.filter((file) =>
    pattern.endsWith('/') ? file.startsWith(pattern) : file === pattern,
  );
  if (offenders.length > 0) {
    problems.push(
      `${offenders.length} file(s) under \`${pattern}\` are tracked. ${entry.why}\n` +
        `      ${offenders.slice(0, 3).join('\n      ')}${offenders.length > 3 ? `\n      …and ${offenders.length - 3} more` : ''}\n` +
        '      Remove them with `git rm --cached`; the working copy can stay.',
    );
  }
  if (!ignoreRules.includes(pattern)) {
    problems.push(
      `\`.gitignore\` no longer lists \`${pattern}\`. That rule is what keeps the ` +
        'artwork out by default — see rule 2 in docs/reference-material.md.',
    );
  }
}

for (const file of REQUIRED) {
  if (!tracked.includes(file)) {
    problems.push(
      `\`${file}\` is not tracked. The catalogue is what keeps this directory ` +
        'browsable and re-fetchable while the artwork is absent; losing it loses the attribution.',
    );
  }
}

if (problems.length > 0) {
  console.error(`\nReference material — ${problems.length} problem(s):\n`);
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error('');
  process.exit(1);
}

console.log(
  `Reference material OK — ${tracked.length} catalogue files tracked, ` +
    `${Object.keys(BARRED).length} barred paths absent and still ignored.`,
);
