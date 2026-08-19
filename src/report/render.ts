/**
 * `renderReport` — a `.tsx` file in, one self-contained `.html` file out.
 *
 * The point of this is to replace the HTML an agent would otherwise hand-write.
 * A report built from these components inherits the whole system: the four-rung
 * theme ladder, roles whose contrast is audited by `pnpm check:contrast`, and
 * components whose appearance is pinned by the visual suite. A hand-written
 * `<div style="...">` inherits none of it and is a fresh design decision every
 * time.
 *
 * The pipeline is three steps and no intermediate artefacts:
 *
 *   TSX --esbuild--> markup --class attributes--> candidates --tailwind--> CSS
 *
 * See `candidates.ts` for why reading the candidates out of finished markup is
 * what makes a single pass possible.
 */

import { Buffer } from 'node:buffer';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractCandidates } from './candidates';
import { buildReportCss } from './css';
import { renderMarkup } from './markup';
import { documentShell } from './shell';
import { THEME_LEVELS, type ThemeLevel } from '../theme/levels';

/**
 * Where this package's own entry and stylesheet sit relative to this module —
 * the same two hops in `src/report/` and in `dist/report/`, which is why this
 * needs no build-time branch.
 */
async function ownPaths() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const source = path.join(here, '..', 'index.ts');
  const entry = await readFile(source, 'utf8').then(
    () => source,
    () => path.join(here, '..', 'index.mjs'),
  );
  return { entry, styles: path.join(here, '..', 'styles.css') };
}

export interface RenderReportOptions {
  /** Path to the report's `.tsx`. Must default-export a component or element. */
  input: string;
  /** Where to write the HTML. Defaults to `input` with an `.html` extension. */
  output?: string;
  /** `<title>`, and nothing else — the report's own heading is its business. */
  title?: string;
  /**
   * Rung of the theme ladder to render at. `white` by default: reports get read
   * in bright rooms and printed, which is the rung documented for exactly that.
   */
  theme?: ThemeLevel;
  /** Strip the webfont import so the file needs no network. */
  offline?: boolean;
  /** Props passed to the report component. */
  props?: Record<string, unknown>;
}

export interface RenderReportResult {
  output: string;
  html: string;
  /** How many distinct utilities the document actually used. */
  candidates: number;
  bytes: number;
}

export async function renderReport({
  input,
  output,
  title,
  theme = 'white',
  offline = false,
  props,
}: RenderReportOptions): Promise<RenderReportResult> {
  if (!THEME_LEVELS.includes(theme)) {
    throw new Error(`Unknown theme level "${theme}". Expected one of: ${THEME_LEVELS.join(', ')}.`);
  }

  const absoluteInput = path.resolve(input);
  const destination = path.resolve(output ?? absoluteInput.replace(/\.tsx?$/, '.html'));
  const { entry, styles } = await ownPaths();

  const body = await renderMarkup({ input: absoluteInput, designSystemEntry: entry, props });
  const candidates = extractCandidates(body);
  const css = await buildReportCss({ entry: styles, candidates, offline });
  const html = documentShell({
    body,
    css,
    theme,
    title: title ?? path.basename(absoluteInput, path.extname(absoluteInput)),
  });

  await writeFile(destination, html, 'utf8');
  return { output: destination, html, candidates: candidates.length, bytes: Buffer.byteLength(html) };
}
