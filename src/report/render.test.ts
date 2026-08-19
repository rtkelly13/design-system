// @vitest-environment node
/**
 * The generator, end to end, over `__fixtures__/minimal.tsx`.
 *
 * The assertion that matters is the negative one: CSS for a utility the document
 * does not use must be **absent**. That is the property the whole design rests
 * on — candidates come from finished markup, so the stylesheet is minimal and
 * complete rather than a scan that has to over-approximate. A test that only
 * checked the used utilities were present would pass equally well against a
 * generator that emitted all of Tailwind.
 *
 * Node environment, not jsdom: this shells out to esbuild and renders through
 * `react-dom/server`.
 */

import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { renderReport, renderReports } from './render';

const FIXTURE = path.join(import.meta.dirname, '__fixtures__/minimal.tsx');
/** The worked example. Rendering it is the regression over every path it uses. */
const SAMPLE = path.join(import.meta.dirname, 'sample.tsx');
const fixture = (name: string) => path.join(import.meta.dirname, '__fixtures__', name);

/**
 * These tests are about rendering, so they skip the typecheck.
 *
 * Not for speed alone, though it is the difference between a 28s suite and a
 * 76s one: in this repo the check follows `paths` into the whole package source,
 * so paying it on every render would be measuring `tsc` over and over rather
 * than the pipeline. `typecheck.test.ts` covers the checker, and the one test
 * below named for it covers the wiring.
 */
const render = (options: Parameters<typeof renderReport>[0]) =>
  renderReport({ typecheck: false, ...options });

let scratch: string;
const out = (name: string) => path.join(scratch, name);

beforeAll(async () => {
  scratch = await mkdtemp(path.join(tmpdir(), 'ds-report-test-'));
});
afterAll(async () => {
  await rm(scratch, { recursive: true, force: true });
});

describe('renderReport', () => {
  it('writes one self-contained document', async () => {
    const result = await render({ input: FIXTURE, output: out('report.html') });
    const html = await readFile(result.output, 'utf8');

    expect(html).toContain('<!doctype html>');
    expect(html).toContain('Fixture');
    // Everything is inline: no stylesheet, script or image to fetch alongside it.
    expect(html).not.toMatch(/<link\b/);
    expect(html).not.toMatch(/<script\b/);
    expect(result.candidates).toBeGreaterThan(0);
    expect(result.bytes).toBe(Buffer.byteLength(html));
  }, 30_000);

  it('emits CSS for the utilities used and none for those not', async () => {
    const { html } = await render({ input: FIXTURE, output: out('scoped.html') });

    // Used by the fixture, directly and through ReportDocument.
    expect(html).toContain('.text-\\[0\\.8125rem\\]');
    expect(html).toContain('.text-content-secondary');
    expect(html).toContain('.font-display');

    // Real Tailwind utilities that nothing in the fixture renders.
    for (const unused of ['.rotate-45', '.animate-spin', '.text-content-inverse']) {
      expect(html).not.toContain(unused);
    }
  }, 30_000);

  it('puts the requested rung on the root element', async () => {
    const { html } = await render({
      input: FIXTURE,
      output: out('midnight.html'),
      theme: 'midnight',
    });
    expect(html).toContain('<html lang="en" data-theme="midnight" class="midnight">');
    // Every rung's tokens ship regardless, so a nested `ThemeProvider scoped`
    // panel inside a report still resolves.
    expect(html).toContain('[data-theme="white"]');
  }, 30_000);

  it('rejects a level that is not on the ladder', async () => {
    await expect(
      render({ input: FIXTURE, output: out('bogus.html'), theme: 'neon' as never }),
    ).rejects.toThrow(/Unknown theme level "neon"/);
  });

  /** Every path the sample exercises, in one render. */
  it('renders the worked example end to end', async () => {
    const { html, candidates } = await render({ input: SAMPLE, output: out('sample.html') });

    // Static disclosure — the one interactive affordance that needs no script.
    expect(html).toContain('<details');
    expect(html).not.toMatch(/<script\b/);
    // Sections are addressable, from the title, so the contents list resolves.
    expect(html).toContain('id="coverage"');
    expect(html).toContain('href="#coverage"');
    // The zero case renders its designed text rather than an empty table.
    expect(html).toContain('No advisories. 24 packages audited.');
    // A runtime accent travels as a custom property, never as a class.
    expect(html).toContain('var(--ds-intent-success)');
    // Rich enough to be a real regression rather than a smoke test.
    expect(candidates).toBeGreaterThan(120);
  }, 60_000);

  /**
   * Every rung's tokens ship in the stylesheet regardless of which one the
   * document declares, so a subtree can declare a different one. This is the
   * capability behind a differently-themed panel inside a report, and it would
   * break silently.
   *
   * The fixture scopes to `dim`, which is neither the document's level nor
   * `DEFAULT_LEVEL` — and the assertion reads the **body**, not the whole file,
   * because the stylesheet names every rung in its own variant selectors. An
   * earlier version of this test asserted against the whole document for a level
   * that happened to be the provider's default, and would have passed against a
   * provider that ignored its props entirely.
   */
  it('resolves a scoped ThemeProvider inside a report', async () => {
    const { html } = await render({
      input: fixture('scoped.tsx'),
      output: out('scoped.html'),
    });
    const body = html.slice(html.indexOf('</style>'));
    expect(html).toContain('<html lang="en" data-theme="white"');
    expect(body).toContain('data-theme="dim"');
    expect(body).not.toContain('data-theme="midnight"');
  }, 30_000);

  it('drops the webfont import only when asked', async () => {
    const online = await render({ input: FIXTURE, output: out('online.html') });
    const offline = await render({
      input: FIXTURE,
      output: out('offline.html'),
      offline: true,
    });

    expect(online.html).toContain('fonts.googleapis.com');
    expect(offline.html).not.toContain('fonts.googleapis.com');
    // The type still resolves, because the font tokens declare fallback stacks.
    expect(offline.html).toContain('sans-serif');
  }, 30_000);

  /**
   * Determinism is the property that makes a generated report diffable, and it
   * is not free: the pipeline sorts its candidates, and the lint blocks the
   * values that would otherwise vary. Two renders, byte for byte.
   */
  it('renders the same bytes twice', async () => {
    const first = await render({ input: SAMPLE, output: out('det-1.html') });
    const second = await render({ input: SAMPLE, output: out('det-2.html') });
    expect(first.html).toBe(second.html);
    expect(first.bytes).toBe(second.bytes);
  }, 60_000);

  it('defaults the output path to the input with an .html extension', async () => {
    // Genuinely omits `output`, so this writes beside the fixture and cleans up.
    const result = await render({ input: FIXTURE });
    try {
      expect(result.output).toBe(FIXTURE.replace(/\.tsx$/, '.html'));
      await expect(readFile(result.output, 'utf8')).resolves.toContain('Fixture');
    } finally {
      await rm(result.output, { force: true });
    }
  }, 30_000);

  /**
   * The level lives on `<html>`, so the markup — and therefore the candidate set
   * and the stylesheet — is identical on every rung. Four documents cost one
   * bundle, one render and one Tailwind compile, which is what makes rendering
   * the whole ladder cheap enough to do in a regression suite.
   */
  it('emits every rung from a single render', async () => {
    const themes = ['midnight', 'dim', 'bright', 'white'] as const;
    const results = await renderReports({
      typecheck: false,
      inputs: [SAMPLE],
      themes,
      outputFor: (_input, theme) => out(`ladder-${theme}.html`),
    });

    expect(results.map((r) => r.theme)).toEqual([...themes]);
    expect(new Set(results.map((r) => r.candidates)).size).toBe(1);
    // Same document, differing only in the rung it declares.
    const bodies = results.map((r) => r.html.slice(r.html.indexOf('<body>')));
    expect(new Set(bodies).size).toBe(1);
    expect(results[0]?.html).toContain('data-theme="midnight"');
  }, 60_000);
});

describe('the design system lint', () => {
  it('refuses a report that addresses colours instead of roles', async () => {
    await expect(
      render({ input: fixture('lints-badly.tsx'), output: out('bad.html') }),
    ).rejects.toThrow(/breaks 3 design system rule\(s\)[\s\S]*Hex literals/);
  });

  /** Cheap enough to run first, so a bad file never pays for a render. */
  it('rejects before writing anything', async () => {
    const destination = out('never-written.html');
    await expect(
      render({ input: fixture('lints-badly.tsx'), output: destination }),
    ).rejects.toThrow();
    await expect(readFile(destination, 'utf8')).rejects.toThrow();
  });

  it('renders through warnings, and reports them', async () => {
    const { warnings } = await render({
      input: fixture('warns.tsx'),
      output: out('warns.html'),
    });
    expect(warnings.map((w) => w.rule).sort()).toEqual(['inert', 'nondeterministic']);
  }, 30_000);

  it('promotes warnings to errors under strict', async () => {
    await expect(
      render({ input: fixture('warns.tsx'), output: out('strict.html'), strict: true }),
    ).rejects.toThrow(/breaks 2 design system rule\(s\)/);
  });

  /** The one place the typecheck's wiring into the pipeline is asserted. */
  it('refuses a report that does not typecheck, before rendering', async () => {
    const destination = out('typed.html');
    await expect(
      renderReport({ input: fixture('broken-types.tsx'), output: destination }),
    ).rejects.toThrow(/tsc rejected the report[\s\S]*TS2322/);
    await expect(readFile(destination, 'utf8')).rejects.toThrow();
  }, 60_000);

  it('can be turned off for a file you did not write', async () => {
    const result = await render({
      input: fixture('lints-badly.tsx'),
      output: out('unlinted.html'),
      lint: false,
    });
    expect(result.bytes).toBeGreaterThan(0);
  }, 30_000);
});
