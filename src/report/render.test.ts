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
import { renderReport } from './render';

const FIXTURE = path.join(import.meta.dirname, '__fixtures__/minimal.tsx');

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
    const result = await renderReport({ input: FIXTURE, output: out('report.html') });
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
    const { html } = await renderReport({ input: FIXTURE, output: out('scoped.html') });

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
    const { html } = await renderReport({
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
      renderReport({ input: FIXTURE, output: out('bogus.html'), theme: 'neon' as never }),
    ).rejects.toThrow(/Unknown theme level "neon"/);
  });

  it('drops the webfont import only when asked', async () => {
    const online = await renderReport({ input: FIXTURE, output: out('online.html') });
    const offline = await renderReport({
      input: FIXTURE,
      output: out('offline.html'),
      offline: true,
    });

    expect(online.html).toContain('fonts.googleapis.com');
    expect(offline.html).not.toContain('fonts.googleapis.com');
    // The type still resolves, because the font tokens declare fallback stacks.
    expect(offline.html).toContain('sans-serif');
  }, 30_000);

  it('defaults the output path to the input with an .html extension', async () => {
    // Genuinely omits `output`, so this writes beside the fixture and cleans up.
    const result = await renderReport({ input: FIXTURE });
    try {
      expect(result.output).toBe(FIXTURE.replace(/\.tsx$/, '.html'));
      await expect(readFile(result.output, 'utf8')).resolves.toContain('Fixture');
    } finally {
      await rm(result.output, { force: true });
    }
  }, 30_000);
});
