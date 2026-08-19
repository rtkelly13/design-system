import { defineConfig } from 'tsup';

export default defineConfig({
  // Three entries, not one. The report generator imports esbuild and
  // tailwindcss and is Node-only, so it stays out of the components bundle a
  // browser app loads; the CLI is its own file because `bin` needs one.
  entry: ['src/index.ts', 'src/report/index.ts', 'src/report/cli.ts'],
  format: ['cjs', 'esm'],
  // Types for the two importable entries only. `cli.ts` is a `bin` — nothing
  // imports it, so it has no exported types, and asking the dts worker for a
  // declaration of a file whose only surface is `process` fails there while
  // `tsc --noEmit` is perfectly happy with it.
  dts: { entry: ['src/index.ts', 'src/report/index.ts'] },
  splitting: false,
  sourcemap: true,
  clean: true,
  injectStyle: false,
  external: ['react', 'react-dom'],
  // `src/report/cli.ts` carries a shebang; without this the CJS build strips it
  // and `bin` points at a file the shell cannot execute.
  shims: true,
  onSuccess:
    'cp src/styles.css src/theme.css src/prose.css dist/ && cp src/report/template.tsx dist/report/',
});
