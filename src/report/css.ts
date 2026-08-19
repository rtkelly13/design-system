/**
 * The stylesheet for one report: Tailwind, compiled against a known candidate
 * set and nothing else.
 *
 * `compile()` is Tailwind's own entry point — the same one `@tailwindcss/vite`
 * and the CLI are built on. It needs two resolvers because it does no file I/O
 * itself, and it hands back `sources` (this package's `@source "./"`) for the
 * caller to scan. We ignore that: `extractCandidates` already knows the answer,
 * so `build()` gets the exact list and the scanner never runs.
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { compile } from 'tailwindcss';

const require_ = createRequire(import.meta.url);

/** Resolve an `@import` the way a bundler would, from `base`. */
async function loadStylesheet(id: string, base: string) {
  const file = id.startsWith('.')
    ? path.resolve(base, id)
    : // `@import "tailwindcss"` names a package whose stylesheet is not its
      // main entry, so it cannot go through the generic branch below.
      id === 'tailwindcss'
      ? require_.resolve('tailwindcss/index.css')
      : require_.resolve(id, { paths: [base] });
  return { path: file, base: path.dirname(file), content: await readFile(file, 'utf8') };
}

/** Resolve an `@plugin` — `prose.css` loads `@tailwindcss/typography` this way. */
async function loadModule(id: string, base: string) {
  const file = id.startsWith('.') ? path.resolve(base, id) : require_.resolve(id, { paths: [base] });
  const loaded = await import(file);
  return { path: file, base: path.dirname(file), module: loaded.default ?? loaded };
}

/** Drops the webfont `@import` so the document needs no network to render. */
const WEBFONT_IMPORT = /^@import url\(['"]https:\/\/fonts\.googleapis\.com[^\n]*\n/m;

export interface ReportCssOptions {
  /** The design system's entry stylesheet — `styles.css`, source or built. */
  entry: string;
  candidates: readonly string[];
  /**
   * Strip the Google Fonts import. The `--ds-font-*` tokens all declare real
   * fallback stacks, so the document degrades to system sans and mono rather
   * than losing its type entirely.
   */
  offline?: boolean;
}

export async function buildReportCss({
  entry,
  candidates,
  offline = false,
}: ReportCssOptions): Promise<string> {
  const source = await readFile(entry, 'utf8');
  const compiler = await compile(offline ? source.replace(WEBFONT_IMPORT, '') : source, {
    base: path.dirname(entry),
    loadStylesheet,
    loadModule,
  });
  return compiler.build([...candidates]);
}
