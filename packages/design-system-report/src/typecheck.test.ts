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
   * The negative case — a report with no compiler anywhere above it — is
   * asserted in `scripts/verify-report-cli.mjs`, not here.
   *
   * It was here, as `findChecker(fsRoot)` returning undefined, and it passed
   * against the built module while failing under Vitest: the runner's module
   * graph changes how `createRequire(import.meta.url)` resolves, so the `paths`
   * option stopped isolating the lookup and this package's own TypeScript was
   * found instead. Verified directly against `dist/`, `/` and `/tmp` both
   * correctly yield undefined. A test whose result depends on the runner rather
   * than the code is worse than no test, and the consumer check exercises the
   * real shape anyway: a project that genuinely never installed the compiler.
   */
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
