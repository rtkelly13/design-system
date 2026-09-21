#!/usr/bin/env node
/**
 * Where the repository ends and this package begins.
 *
 * Most gates here reason about the package: its `src/`, its `docs/`, its
 * `package.json`. A few reason about the repository that *contains* it — the
 * workflows in `.github/`, the single `pnpm-lock.yaml` a workspace install
 * writes, the `reference/` material that is not shipped by any package. Those
 * two roots were the same directory until the tree moved under `packages/`,
 * and code that assumed so silently started looking inside the package for
 * files that live a level and a half above it.
 *
 * `git rev-parse --show-toplevel` is the answer rather than `'../..'` because
 * a relative hop is a second place the layout is written down, and it would go
 * stale the next time the tree moves. The fallback covers the one case git
 * cannot answer — a published tarball, or a source copy with no `.git` — where
 * the package is its own repository and the two roots coincide again.
 *
 * Nothing runs on import beyond the `git` call. This file is a constant.
 */

import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** This package — the directory holding its `package.json`. */
export const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** The repository that contains it, or the package itself outside a checkout. */
export const REPO_ROOT = (() => {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], {
      cwd: PACKAGE_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return PACKAGE_ROOT;
  }
})();
