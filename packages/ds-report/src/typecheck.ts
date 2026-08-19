/**
 * Typecheck a report before rendering it.
 *
 * esbuild strips types without reading them, so until this existed a report
 * could pass the lint, bundle cleanly, and then be wrong. `value={{ nope: true }}`
 * on a `StatCard` is not a lint problem and not a runtime crash; it is a report
 * with `[object Object]` in it, discovered by whoever reads the report.
 *
 * ## Why a spawned compiler rather than the API
 *
 * The API would pull the whole of `typescript` into this process for a check
 * that is over in about a second, and it would bind this code to one compiler's
 * internals. Spawning the CLI keeps the compiler swappable — which matters,
 * because the compiler here is expected to change.
 *
 * `tsgo` (`@typescript/native-preview`, the TS 7 native compiler) is a drop-in
 * for `tsc` at the command line. Measured on `sample.tsx` it produced identical
 * diagnostics in **480ms against tsc's 1130ms**. It is *not* used: it is a
 * development preview, and a report check that silently ran on a preview
 * compiler because a consumer happened to have one installed would be a worse
 * bug than a slow check. When it ships, `CHECKERS` below is where it goes.
 *
 * Note that this is independent of the repo's own TS 7 blocker — that one is
 * `tsup`'s dts worker (see AGENTS.md § The TypeScript 7 blocker), and this
 * check is a separate program that never touches it.
 *
 * ## Why it extends the nearest tsconfig
 *
 * A report is written inside somebody's project and may import from it through
 * a path alias. Checking with fixed flags alone would report those as missing
 * modules — a false failure on a correct report, which is the fastest way to get
 * a check switched off. So the generated config extends whatever tsconfig
 * governs the report's directory, and narrows it to the one file.
 */

import { spawn } from 'node:child_process';
import { access, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';

const require_ = createRequire(import.meta.url);

/**
 * Compilers this will use, in order of preference.
 *
 * One entry today. `{ name: 'tsgo', pkg: '@typescript/native-preview', bin:
 * 'tsgo' }` goes at the front when that compiler is released — the rest of this
 * file needs no change, which is the point of spawning a CLI.
 */
const CHECKERS = [{ name: 'tsc', pkg: 'typescript', bin: 'tsc' }] as const;

export interface Checker {
  name: string;
  /** Absolute path to the compiler's JS entry, run with this process's Node. */
  script: string;
}

/**
 * The checker available to the report.
 *
 * Resolved from the *report's* directory rather than this package's, so it is
 * the consumer's compiler that runs — the same one their editor and their CI
 * use. This package depends on neither.
 */
export function findChecker(from: string): Checker | undefined {
  for (const candidate of CHECKERS) {
    try {
      const manifest = require_.resolve(`${candidate.pkg}/package.json`, { paths: [from] });
      const declared = (require_(manifest) as { bin?: Record<string, string> }).bin?.[candidate.bin];
      if (!declared) continue;
      return { name: candidate.name, script: path.resolve(path.dirname(manifest), declared) };
    } catch {
      // Not installed here. Try the next one.
    }
  }
  return undefined;
}

/** The nearest `tsconfig.json` at or above `dir`, if there is one. */
async function nearestTsconfig(dir: string): Promise<string | undefined> {
  let current = dir;
  for (;;) {
    const candidate = path.join(current, 'tsconfig.json');
    try {
      await access(candidate);
      return candidate;
    } catch {
      const parent = path.dirname(current);
      if (parent === current) return undefined;
      current = parent;
    }
  }
}

/**
 * The config the check runs under.
 *
 * `include: []` is not redundant next to `files`: an extended config's `include`
 * is inherited, and without it the check would widen to that project's whole
 * source tree and take seconds rather than one.
 */
async function writeConfig(inputs: readonly string[], directory: string) {
  const base = await nearestTsconfig(path.dirname(inputs[0] as string));
  const config = {
    ...(base ? { extends: base } : {}),
    compilerOptions: {
      noEmit: true,
      strict: true,
      jsx: 'react-jsx',
      module: 'esnext',
      moduleResolution: 'bundler',
      target: 'es2022',
      esModuleInterop: true,
      // The report is what is being checked; a consumer's whole dependency tree
      // is not this check's business, and reading it is most of the runtime.
      skipLibCheck: true,
    },
    files: inputs.map((input) => path.resolve(input)),
    include: [],
  };
  const file = path.join(directory, 'tsconfig.json');
  await writeFile(file, JSON.stringify(config, null, 2), 'utf8');
  return file;
}

export interface TypecheckResult {
  /** The compiler that ran, or `none` if none was installed. */
  checker: string;
  /** Compiler diagnostics, verbatim. Empty when the reports are sound. */
  diagnostics: string;
  ok: boolean;
}

/**
 * Check every report in one compiler run.
 *
 * One invocation for N reports rather than N invocations, for the same reason
 * the Tailwind compiler is built once per invocation: loading the lib types and
 * React's is most of the cost, and it is identical for every file.
 */
export async function typecheckReports(inputs: readonly string[]): Promise<TypecheckResult> {
  const first = path.resolve(inputs[0] as string);
  const checker = findChecker(path.dirname(first));
  if (!checker) return { checker: 'none', diagnostics: '', ok: true };

  // The config must sit where the reports do: module resolution walks up from
  // the config's own directory looking for `node_modules`, and a directory under
  // the OS temp dir has none. Removed in the `finally`.
  const scratch = await mkdtemp(path.join(path.dirname(first), '.ds-report-tsc-'));
  try {
    const config = await writeConfig(inputs, scratch);
    const { code, text } = await new Promise<{ code: number | null; text: string }>((resolve) => {
      const child = spawn(process.execPath, [checker.script, '--project', config], {
        cwd: path.dirname(first),
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      let text = '';
      child.stdout.on('data', (chunk) => (text += chunk));
      child.stderr.on('data', (chunk) => (text += chunk));
      child.on('close', (status) => resolve({ code: status, text }));
    });

    return {
      checker: checker.name,
      // Diagnostics come out relative to the scratch directory the config lives
      // in. Rewriting them to the report's own directory is what makes an error
      // clickable in an editor.
      diagnostics: text.replaceAll(`${path.basename(scratch)}${path.sep}..${path.sep}`, ''),
      ok: code === 0,
    };
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
}
