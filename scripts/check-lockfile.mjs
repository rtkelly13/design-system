#!/usr/bin/env node
// Lockfile protocol guard.
//
// Fails if pnpm-lock.yaml pins any dependency to a git/SSH resolution
// (`git@github.com:…`, `git+ssh://…`, `type: git`, …) or out-of-repo resolution
// (`file:../…`, `link:../…`). Those clone or link over paths or protocols
// that build environments don't have, turning cold builds into hard failures.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const LOCKFILE = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'pnpm-lock.yaml',
);

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
  },
];

let text;
try {
  text = readFileSync(LOCKFILE, 'utf8');
} catch (err) {
  console.error(`✖ Could not read ${LOCKFILE}: ${err.message}`);
  process.exit(2);
}

const violations = [];
text.split('\n').forEach((line, i) => {
  for (const { re, label } of FORBIDDEN) {
    if (re.test(line)) {
      violations.push({ line: i + 1, label, text: line.trim() });
      break;
    }
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
