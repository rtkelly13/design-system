import { defineConfig } from 'vitest/config';

/**
 * Unit tests live beside the code as `src/**\/*.test.ts(x)`.
 *
 * The Playwright suites in `tests/` are `*.spec.ts` and are matched there by
 * `testDir`, so the two runners never see each other's files. Keeping the
 * extensions distinct is what makes that true — a unit test named `.spec.ts`
 * would be collected by Playwright and fail without a browser.
 */
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/hooks/**'],
      reporter: ['text', 'lcov'],
    },
  },
});
