import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/tailwind-preset.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  injectStyle: false,
  external: ['react', 'react-dom'],
  // Flatten `export default` onto module.exports for CJS consumers so
  // `require('@rtkelly13/design-system/tailwind-preset')` yields the preset
  // itself (Tailwind ignores a module-namespace object as a preset). Named
  // exports are kept as properties; the guard keeps the line inert in ESM.
  footer: {
    js: "if (typeof module !== 'undefined' && module.exports && module.exports.default) { module.exports = Object.assign(module.exports.default, module.exports); }",
  },
  onSuccess: 'cp src/styles.css src/theme.css dist/',
});
