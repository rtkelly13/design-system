#!/usr/bin/env node
// Lockfile protocol guard.
//
// Fails if pnpm-lock.yaml pins any dependency to a git/SSH resolution
// (`git@github.com:…`, `git+ssh://…`, `type: git`, …) or out-of-repo resolution
// (`file:../…`, `link:../…`). Those clone or link over paths or protocols
// that build environments don't have, turning cold builds into hard failures.

import { existsSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { REPO_ROOT } from './repo-root.mjs';

// The repository's lockfile, not the package's: a pnpm workspace writes one
// `pnpm-lock.yaml` at the root covering every package, and that single file is
// what `pnpm install --frozen-lockfile` reads. Resolved against the package,
// this guard read a path that cannot exist and failed before it could check
// anything.
const LOCKFILE = join(REPO_ROOT, 'pnpm-lock.yaml');

// Each pattern targets a resolution form that requires unavailable git/SSH auth
// or out-of-repo local filesystem paths.
const FORBIDDEN = [
  { re: /git@[\w.-]+:/, label: 'SSH clone URL (git@host:…)' },
  { re: /git\+ssh:\/\//, label: 'git+ssh:// resolution' },
  {
    re: /git\+https:\/\/git@/,
    label: 'git+https with SSH user (git+https://git@…)',
  },
  {
    re: /\brepo:\s*['"]?git@/,
    label: 'git repo over SSH (repo: git@…)',
  },
  {
    // Unanchored: pnpm emits `type: git` both as a block mapping line and
    // inside a flow mapping such as
    // `resolution: {commit: …, repo: https://…, type: git}`.
    re: /\btype:\s*git\b/,
    label: 'git-type resolution (type: git)',
  },
  {
    re: /file:\.\.\//,
    label: 'out-of-repo file: dependency (file:../…)',
  },
  {
    // Unanchored for the same flow-mapping reason as `type:` above: the
    // `directory` key need not follow `resolution: {` immediately.
    re: /\bdirectory:\s*['"]?\.\./,
    label: 'out-of-repo directory resolution',
  },
  {
    re: /link:\.\.\//,
    label: 'out-of-repo link: dependency (link:../…)',
    // A workspace sibling is written exactly this way, so this one is
    // resolved against the importer rather than matched on sight. See below.
    resolveAgainstImporter: true,
  },
];

let text;
try {
  text = readFileSync(LOCKFILE, 'utf8');
} catch (err) {
  console.error(`✖ Could not read ${LOCKFILE}: ${err.message}`);
  process.exit(2);
}

/*
 * `link:../design-system` is what pnpm writes for a `workspace:*` dependency
 * between two packages in this repository. Read on sight it looks identical to
 * the thing this guard exists to catch — a `pnpm link` at someone's checkout,
 * which is unresolvable anywhere else — and until the tree moved under
 * `packages/` the two could not be told apart, because there was only ever one
 * package and any `../` left the repo.
 *
 * Now they can: the difference is whether the target stays inside the
 * repository, and that depends on which importer the line belongs to.
 * `link:../design-system` under `importers: packages/design-system-report` is
 * the sibling and is fine; the same string under `importers: .` points outside
 * and is not. So the scan tracks the current importer and resolves the target
 * before judging it.
 */
const importerOf = (() => {
  let current = '.';
  let inImporters = false;
  return (line) => {
    if (/^importers:/.test(line)) { inImporters = true; return current; }
    if (inImporters && /^\S/.test(line)) inImporters = false;
    const header = inImporters && line.match(/^  ([^\s:]+):\s*$/);
    if (header) current = header[1];
    return current;
  };
})();

const violations = [];
text.split('\n').forEach((line, i) => {
  const importer = importerOf(line);
  for (const { re, label, resolveAgainstImporter } of FORBIDDEN) {
    if (!re.test(line)) continue;
    if (resolveAgainstImporter) {
      const target = line.match(/link:(\S+)/)?.[1];
      const abs = resolve(REPO_ROOT, importer, target ?? '');
      const rel = relative(REPO_ROOT, abs);
      const insideRepo = rel !== '' && !rel.startsWith('..') && existsSync(abs);
      if (insideRepo) break;
    }
    violations.push({ line: i + 1, label, text: line.trim() });
    break;
  }
});

if (violations.length === 0) {
  console.log(
    '✓ Lockfile protocol guard: no forbidden dependency resolutions found.',
  );
  process.exit(0);
}

console.error('✖ Lockfile protocol guard failed.\n');
console.error(
  'pnpm-lock.yaml pins dependencies to git/SSH or out-of-repo resolutions\n' +
    'that cold build environments (CI, Vercel) cannot authenticate or locate.\n',
);
for (const v of violations) {
  console.error(`  pnpm-lock.yaml:${v.line}  [${v.label}]`);
  console.error(`    ${v.text}`);
}
process.exit(1);
