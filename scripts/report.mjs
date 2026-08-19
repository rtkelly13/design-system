/**
 * Runs the report CLI straight from `src/`, so a report can be rendered in this
 * repo without building first.
 *
 *   pnpm report path/to/report.tsx --theme midnight
 *
 * Consumers get the built `ds-report` bin instead. The one subtlety is *where*
 * the bundle is written: the renderer finds this package's own entry and
 * stylesheet two hops up from its own module — `../index.ts` in `src/`,
 * `../index.mjs` in `dist/` — so the dev bundle has to sit in `src/report/` for
 * that to resolve. It is gitignored, and dot-prefixed so neither tsup, knip nor
 * tsc picks it up.
 */

import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outfile = path.join(root, 'src/report/.dev-cli.mjs');

await build({
  entryPoints: [path.join(root, 'src/report/cli.ts')],
  outfile,
  bundle: true,
  format: 'esm',
  platform: 'node',
  // esbuild and tailwindcss resolve from this repo at runtime, not from a bundle.
  packages: 'external',
  logLevel: 'warning',
});

await import(pathToFileURL(outfile).href);
