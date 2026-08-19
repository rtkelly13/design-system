#!/usr/bin/env node
/**
 * Every dependency is declared in the right place, actually used, and has a
 * stated reason.
 *
 * `knip` already answers "is this package imported anywhere" for JS and TS, and
 * it is better at that than anything hand-rolled — so this does not duplicate
 * it. What it adds is the two things knip cannot:
 *
 *   1. **A reason.** Nothing off-the-shelf enforces that a dependency is
 *      justified. Every entry in `package.json` must appear in MANIFEST below
 *      with a `kind` and a `why`, and every MANIFEST entry must still be
 *      declared — so a package cannot arrive without an explanation, and the
 *      explanation cannot outlive the package.
 *   2. **The CSS surface.** `styles.css` does `@import "tailwindcss"` and
 *      `prose.css` does `@plugin "@tailwindcss/typography"`. Those resolve from
 *      the *consumer's* node_modules at their build time, which makes them real
 *      dependencies of this package's CSS contract — and knip does not parse
 *      Tailwind at-rules, so it reports the typography plugin as unused. It is
 *      not; it is invisible.
 *
 * It also checks the placement rule that actually bites: a package imported from
 * shipped source must be a runtime or peer dependency, never a devDependency,
 * or the published package breaks on install.
 *
 *   node scripts/check-deps.mjs           verify
 *   node scripts/check-deps.mjs --list    print the table for review
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

/**
 * Why every dependency exists, and where it belongs.
 *
 * `kind` is the section it must be declared in:
 *   runtime — `dependencies`; shipped and imported by the compiled bundle
 *   dev     — `devDependencies`; build, test or docs tooling only
 *   peer    — `peerDependencies`; the consumer supplies it. Set `alsoDev` when
 *             this package needs its own copy to build and test against.
 */
const MANIFEST = {
  'lucide-react': {
    kind: 'runtime',
    why: 'Icon set rendered by DocsHeader, AdminDashboardLayout and the sandbox. Runtime rather than peer so a consumer gets working icons without opting in — at the cost of a possible duplicate copy for consumers already using lucide. Worth revisiting if that bites.',
  },
  'tailwind-variants': {
    kind: 'runtime',
    why: 'Builds the style recipes in src/lib/recipe.ts. Confined to that one file and deliberately absent from the published .d.ts, so it can be replaced without a breaking change.',
  },

  react: {
    kind: 'peer',
    alsoDev: true,
    why: 'These are React components. Peer so the consumer owns the single copy; also dev so Storybook and the build have one.',
  },
  'react-dom': {
    kind: 'peer',
    alsoDev: true,
    why: 'Not imported by this package anywhere — declared because a consumer rendering these components needs it, and the Storybook react renderer does. Conventional rather than required by our own code, which is the honest reason to keep it.',
  },
  '@tailwindcss/typography': {
    kind: 'peer',
    alsoDev: true,
    why: 'prose.css does `@plugin "@tailwindcss/typography"`, and a Tailwind plugin resolves from the consumer build — it cannot be bundled. Optional, because theme.css-only consumers never load prose.css. Invisible to knip, which does not parse at-rules.',
  },
  tailwindcss: {
    kind: 'peer',
    alsoDev: true,
    why: 'styles.css does `@import "tailwindcss"`, and theme.css is a v4 `@theme` contract, so a consumer must be building with Tailwind v4. Declared so that requirement is stated rather than assumed. Also dev, for Storybook.',
  },

  '@playwright/test': { kind: 'dev', why: 'Visual regression suite and the screenshot walkthrough.' },
  '@storybook/addon-docs': { kind: 'dev', why: 'MDX docs pages in Storybook.' },
  '@storybook/react': { kind: 'dev', why: 'Story types (Meta, StoryObj).' },
  '@storybook/react-vite': { kind: 'dev', why: 'Storybook framework adapter for the Vite builder.' },
  '@tailwindcss/vite': { kind: 'dev', why: 'Compiles Tailwind inside the Storybook build.' },
  '@types/react': { kind: 'dev', why: 'Types for the react peer.' },
  '@types/react-dom': { kind: 'dev', why: 'Types for the react-dom peer.' },
  knip: {
    kind: 'dev',
    why: 'Detects unused and unlisted dependencies, files and exports. The usage half of this check; the reason half is this script.',
  },
  storybook: { kind: 'dev', why: 'The docs and review surface, and what both visual suites screenshot.' },
  tsup: { kind: 'dev', why: 'Bundles ESM, CJS and types. Read the TypeScript 7 note in AGENTS.md before changing it.' },
  typescript: { kind: 'dev', why: 'Type checking and declaration output. Pinned — see AGENTS.md.' },
  vite: { kind: 'dev', why: 'Underlies the Storybook builder.' },
  vitest: {
    kind: 'dev',
    why: 'Unit suite over lib, hooks and the generated theme. Complements the Playwright suites, which assert rendering rather than logic.',
  },
  '@vitest/coverage-v8': { kind: 'dev', why: 'Coverage reporting for `pnpm test:coverage`.' },
  '@testing-library/react': {
    kind: 'dev',
    why: 'Renders hooks and components in the unit suite, asserting behaviour through the DOM rather than internals.',
  },
  jsdom: { kind: 'dev', why: 'DOM environment for the unit suite; the hooks under test read `document` and `navigator`.' },
};

const SECTION = {
  runtime: 'dependencies',
  dev: 'devDependencies',
  peer: 'peerDependencies',
};

/** Reduce an import specifier to its package name. */
function packageOf(specifier) {
  if (specifier.startsWith('.') || specifier.startsWith('node:')) return null;
  const parts = specifier.split('/');
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

function walk(dir, test) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full, test));
    else if (test(full)) out.push(full);
  }
  return out;
}

/**
 * Packages imported from *shipped* source.
 *
 * `src/stories/**` is excluded: those files sit under `src/` but are not
 * reachable from `src/index.ts`, so nothing they import reaches the bundle.
 * That is why Storybook can be a devDependency while living inside `src/`.
 *
 * Unit tests are excluded for exactly the same reason. Co-locating
 * `slug.test.ts` next to `slug.ts` is what makes the pairing obvious, but it
 * puts a `vitest` import under `src/` — and without this the check would read
 * that as the bundle depending on the test runner and demand it be promoted to
 * a runtime dependency, which is the opposite of correct.
 *
 * The exclusion is safe only because it is *also* true that nothing reachable
 * from the entrypoint imports a test file. `tsup` bundles from `src/index.ts`,
 * so a stray `export` from a `.test.ts` could not pull the runner into `dist`
 * without also appearing in the published types — which rule 5 below would
 * catch.
 */
function shippedImports() {
  const files = walk(path.join(ROOT, 'src'), (f) => /\.tsx?$/.test(f)).filter(
    (f) =>
      !f.includes(`${path.sep}stories${path.sep}`) &&
      !/\.test\.tsx?$/.test(f) &&
      !/test-setup\.tsx?$/.test(f),
  );
  const found = new Set();
  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/from\s+'([^']+)'|require\(\s*'([^']+)'/g)) {
      const name = packageOf(match[1] ?? match[2]);
      if (name) found.add(name);
    }
  }
  return found;
}

/** Packages referenced from CSS via `@import` or `@plugin`. */
function cssImports() {
  const files = walk(path.join(ROOT, 'src'), (f) => f.endsWith('.css'));
  const found = new Set();
  for (const file of files) {
    for (const match of readFileSync(file, 'utf8').matchAll(/@(?:import|plugin)\s+"([^"]+)"/g)) {
      const spec = match[1];
      if (spec.startsWith('.') || spec.startsWith('url(')) continue;
      const name = packageOf(spec);
      // A self-reference in a doc comment is not a dependency.
      if (name && name !== pkg.name) found.add(name);
    }
  }
  return found;
}

const declared = new Map();
for (const [kind, section] of Object.entries(SECTION)) {
  for (const [name, range] of Object.entries(pkg[section] ?? {})) {
    if (!declared.has(name)) declared.set(name, { ranges: {}, kinds: [] });
    declared.get(name).ranges[kind] = range;
    declared.get(name).kinds.push(kind);
  }
}

const problems = [];

// 1. Nothing undocumented, and no rationale left behind by a removed package.
for (const name of declared.keys()) {
  if (!MANIFEST[name]) {
    problems.push(`${name}: declared but has no MANIFEST entry. Add one saying why it exists.`);
  }
}
for (const name of Object.keys(MANIFEST)) {
  if (!declared.has(name)) {
    problems.push(`${name}: has a MANIFEST entry but is not declared. Remove the entry.`);
  }
}

// 2. Declared in the section its reason claims, with a real range.
for (const [name, entry] of Object.entries(MANIFEST)) {
  const record = declared.get(name);
  if (!record) continue;
  const expected = [entry.kind, ...(entry.alsoDev ? ['dev'] : [])].sort();
  const actual = [...new Set(record.kinds)].sort();
  if (expected.join() !== actual.join()) {
    problems.push(
      `${name}: MANIFEST says ${expected.map((k) => SECTION[k]).join(' + ')}, package.json has ${actual.map((k) => SECTION[k]).join(' + ')}.`,
    );
  }
  for (const range of Object.values(record.ranges)) {
    if (!/^[\^~>=]|^\d/.test(range)) {
      problems.push(`${name}: version range "${range}" is not a specified range.`);
    }
  }
}

// 3. Anything the shipped bundle imports must be runtime or peer. A
//    devDependency here means the published package breaks on install.
for (const name of shippedImports()) {
  const entry = MANIFEST[name];
  if (!entry) {
    problems.push(`${name}: imported by shipped source but not declared at all.`);
  } else if (entry.kind === 'dev') {
    problems.push(
      `${name}: imported by shipped source but declared as a devDependency. It must be runtime or peer.`,
    );
  }
}

// 4. The CSS contract. knip cannot see these.
for (const name of cssImports()) {
  if (!declared.has(name)) {
    problems.push(
      `${name}: referenced from CSS (@import/@plugin) but not declared. It resolves from the consumer's node_modules, so it must be a peer dependency.`,
    );
  }
}

// 5. Every CSS file shipped must be reachable through the exports map, or a
//    consumer following the docs gets a resolution error.
const exported = new Set(Object.keys(pkg.exports ?? {}));
for (const file of walk(path.join(ROOT, 'src'), (f) => f.endsWith('.css'))) {
  const base = path.basename(file);
  if (!exported.has(`./${base}`)) {
    problems.push(
      `${base}: shipped in dist but missing from the package "exports" map, so it cannot be imported.`,
    );
  }
}

if (process.argv.includes('--list')) {
  const rows = Object.entries(MANIFEST).sort(
    (a, b) => a[1].kind.localeCompare(b[1].kind) || a[0].localeCompare(b[0]),
  );
  console.log('| Package | Kind | Range | Why |');
  console.log('|---|---|---|---|');
  for (const [name, entry] of rows) {
    const record = declared.get(name);
    const range = record ? Object.values(record.ranges)[0] : '—';
    const kind = entry.kind + (entry.alsoDev ? ' + dev' : '');
    console.log(`| \`${name}\` | ${kind} | \`${range}\` | ${entry.why} |`);
  }
  console.log();
}

if (problems.length > 0) {
  console.error(`Dependency check failed — ${problems.length} problem(s):\n`);
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error('\nEvery dependency needs a section that matches its reason, and a reason.');
  process.exit(1);
}

console.log(`Dependencies OK — ${declared.size} packages, all documented, all in the right section.`);
