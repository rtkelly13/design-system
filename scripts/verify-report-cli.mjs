#!/usr/bin/env node
/**
 * Prove the *published* report generator works, from a consumer's position.
 *
 * Everything else that tests the generator runs from `src/` inside this repo,
 * where every dependency is already installed and every path resolves. None of
 * that exercises what a consumer actually gets: a tarball, an `exports` map, a
 * `bin`, and two peer dependencies they have to install themselves.
 *
 * So this packs the package, installs it into a throwaway project alongside the
 * peers, and drives `ds-report` the way an agent would. It is the only check
 * that would catch a broken `bin` path, a missing file in `files`, an entry
 * absent from `exports`, or a peer that is documented as optional but is not.
 *
 *   node scripts/verify-report-cli.mjs
 *   node scripts/verify-report-cli.mjs --keep    leave the temp project behind
 */

import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const KEEP = process.argv.includes('--keep');

const failures = [];
const check = (label, condition, detail = '') => {
  const ok = Boolean(condition);
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${label}${detail && !ok ? `\n          ${detail}` : ''}`);
  if (!ok) failures.push(label);
};

/**
 * `out` merges stdout and stderr on purpose. The CLI writes its result to stdout
 * and its warnings and notes to stderr, and an earlier version of this harness
 * captured only the former — so a check for a note that the CLI *was* emitting
 * failed, and the harness looked like the code was broken.
 */
function run(command, args, cwd, allowFailure = false) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  const out = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  if (result.status !== 0 && !allowFailure) {
    throw new Error(`${command} ${args.join(' ')} exited ${result.status}\n${out}`);
  }
  return { ok: result.status === 0, out };
}

const REPORT = `import { Card, ReportDocument, ReportSection, StatCard } from '@rtkelly13/design-system';

export default function Report() {
  return (
    <ReportDocument title="Consumer" meta={[{ label: 'Source', value: 'tarball' }]}>
      <ReportSection title="Summary">
        <StatCard title="Packages" value={1} accent="success" />
        <Card><p className="text-content-secondary">Rendered from an install.</p></Card>
      </ReportSection>
    </ReportDocument>
  );
}
`;

/** A report the lint must refuse, to prove the rules ship and run. */
const BAD_REPORT = `import { Card, ReportDocument } from '@rtkelly13/design-system';

export default function Report() {
  return (
    <ReportDocument title="Bad">
      <Card className="bg-zinc-900" />
    </ReportDocument>
  );
}
`;

console.log('Packing the package…');
const packed = run('pnpm', ['pack', '--pack-destination', tmpdir()], ROOT).out.trim().split('\n');
const tarball = packed[packed.length - 1];

const project = mkdtempSync(path.join(tmpdir(), 'ds-consumer-'));
console.log(`Consumer project: ${project}\n`);

try {
  writeFileSync(
    path.join(project, 'package.json'),
    JSON.stringify({ name: 'consumer', private: true, version: '1.0.0' }, null, 2),
  );
  writeFileSync(path.join(project, 'report.tsx'), REPORT);
  writeFileSync(path.join(project, 'bad.tsx'), BAD_REPORT);

  // Exactly what the README tells a consumer to install, and nothing else. If
  // the generator needs something not on this list, that is the bug — and it was
  // once: the typography plugin is declared optional, but the report compiles
  // `styles.css`, which imports `prose.css`, which loads it. Installing only the
  // documented set is what surfaced that.
  console.log('Installing the tarball and the documented peers…');
  run('pnpm', ['add', tarball, 'react', 'react-dom', 'esbuild', 'tailwindcss'], project);

  const cli = ['--yes', 'ds-report'];
  console.log('\nDriving ds-report:');

  const first = run('npx', [...cli, 'report.tsx', '--theme', 'midnight,white', '--strict'], project);
  check('renders both rungs from one invocation', first.ok);

  const white = path.join(project, 'report.white.html');
  const midnight = path.join(project, 'report.midnight.html');
  const whiteHtml = readFileSync(white, 'utf8');
  check('writes one file per rung', whiteHtml.length > 0 && readFileSync(midnight, 'utf8').length > 0);
  check('declares the rung on the root element', whiteHtml.includes('data-theme="white"'));
  check('emits no script tag', !/<script\b/.test(whiteHtml));
  check('emits no external stylesheet', !/<link\b/.test(whiteHtml));
  check('inlines the utilities the report uses', whiteHtml.includes('.bg-surface-base'));
  check('renders the components, not a stub', whiteHtml.includes('Rendered from an install.'));

  run('npx', [...cli, 'report.tsx', '--theme', 'white', '-o', 'again.html'], project);
  check(
    'renders the same bytes twice',
    readFileSync(path.join(project, 'again.html'), 'utf8') === whiteHtml,
  );

  const bad = run('npx', [...cli, 'bad.tsx'], project, true);
  check('lint rules ship and block', !bad.ok && /bg-zinc-900/.test(bad.out), bad.out.slice(0, 300));

  // The typography plugin is optional and absent here. That must degrade the
  // prose layer with a note, not crash the render.
  check(
    'renders without the optional typography plugin',
    /@tailwindcss\/typography is not installed/.test(first.out),
    first.out.slice(0, 300),
  );

  console.log('\nAdding the typography plugin, to check the note goes away:');
  run('pnpm', ['add', '@tailwindcss/typography'], project);
  const withProse = run('npx', [...cli, 'report.tsx', '-o', 'prose.html'], project, true);
  check(
    'no note once the plugin is installed',
    withProse.ok && !/typography is not installed/.test(withProse.out),
    withProse.out.slice(0, 300),
  );

  // The optional-peer promise: `esbuild` is documented as one, so its absence
  // has to produce an install instruction rather than a stack trace.
  console.log('\nRemoving esbuild, to check the optional-peer message:');
  run('pnpm', ['remove', 'esbuild'], project);
  const missing = run('npx', [...cli, 'report.tsx'], project, true);
  check(
    'a missing optional peer explains itself',
    !missing.ok && /optional peer dependency/.test(missing.out) && /pnpm add/.test(missing.out),
    missing.out.slice(0, 300),
  );
} finally {
  if (KEEP) console.log(`\nLeft in place: ${project}`);
  else {
    rmSync(project, { recursive: true, force: true });
    rmSync(tarball, { force: true });
  }
}

console.log('');
if (failures.length > 0) {
  console.error(`Published report CLI failed ${failures.length} check(s):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exitCode = 1;
} else {
  console.log('Published report CLI OK — packed, installed, and driven as a consumer.');
}
