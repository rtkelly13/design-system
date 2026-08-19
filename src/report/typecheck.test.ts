// @vitest-environment node
/**
 * The report typechecker.
 *
 * The expensive assertions are deliberately few. Checking a report that imports
 * this package costs about a second in a consumer project and about four here,
 * because this repo's tsconfig maps the package name onto `src/` and the check
 * then follows the import into the whole source tree rather than stopping at a
 * `.d.ts` that `skipLibCheck` would skip. That difference is a property of the
 * repo, not of the checker, and `scripts/verify-report-cli.mjs` measures the
 * consumer number that actually matters.
 */

import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { findChecker, typecheckReports } from './typecheck';

const fixture = (name: string) => path.join(import.meta.dirname, '__fixtures__', name);

describe('findChecker', () => {
  it('finds the compiler installed alongside the report', () => {
    const checker = findChecker(import.meta.dirname);
    expect(checker?.name).toBe('tsc');
    expect(checker?.script).toMatch(/typescript[/\\]bin[/\\]tsc$/);
  });

  /**
   * Resolution starts at the report, not at this package, so it is the
   * consumer's compiler that runs — the same one their editor uses. A root with
   * no `node_modules` anywhere above it therefore finds nothing, which is the
   * case that has to degrade rather than throw.
   */
  it('returns nothing when no compiler is installed near the report', () => {
    expect(findChecker(path.parse(process.cwd()).root)).toBeUndefined();
  });
});

describe('typecheckReports', () => {
  it('rejects a report whose props do not typecheck', async () => {
    const result = await typecheckReports([fixture('broken-types.tsx')]);
    expect(result.ok).toBe(false);
    expect(result.checker).toBe('tsc');
    // A wrong prop type, a value outside a union, and an undeclared name — none
    // of which the lint can see and none of which crashes at render.
    expect(result.diagnostics).toContain('TS2322');
    expect(result.diagnostics).toContain('AccentToken');
    expect(result.diagnostics).toContain('TS2304');
  }, 60_000);

  /** Diagnostics must point at the report, not at the scratch config. */
  it('reports paths relative to the report, not the temp config', async () => {
    const { diagnostics } = await typecheckReports([fixture('broken-types.tsx')]);
    expect(diagnostics).toContain('broken-types.tsx(');
    expect(diagnostics).not.toContain('.ds-report-tsc-');
  }, 60_000);

  it('passes a sound report', async () => {
    const result = await typecheckReports([fixture('minimal.tsx')]);
    expect(result.ok).toBe(true);
    expect(result.diagnostics.trim()).toBe('');
  }, 60_000);
});
