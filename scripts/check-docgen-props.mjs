/**
 * Does every documented component publish its props?
 *
 * The Storybook is the published documentation surface, and for eight components
 * it published a docs page with an empty props table. Nothing errored; an empty
 * table renders as an empty table. That is the same failure mode `ci.yml`
 * records for the visual suite — every baseline was once a screenshot of the
 * "No Preview" panel while the suite passed throughout.
 *
 * `Button` was the one that mattered. Its props are a union
 * (`ButtonElementProps | ButtonLinkProps`) and the default `react-docgen`
 * resolves neither a union nor the `DetailedHTMLProps` intersections inside one
 * — so it emitted the component *with no props rather than failing*, and the
 * most-copied component in the package documented nothing.
 *
 * `.storybook/main.ts` now uses `react-docgen-typescript`. This is the gate that
 * keeps it working, since the extractor degrades silently in exactly the same
 * way if it is ever swapped back.
 *
 * ## Scope: components with a docs page
 *
 * Read from `storybook-static/index.json`, the same file `check:visual-coverage`
 * reads, so the two agree about what a component is. A specimen that renders
 * inside one page and takes no props is not a documentation failure, so
 * `EXCLUDED` carries those with a reason — the same contract
 * `check:visual-coverage` uses.
 *
 *   node scripts/check-docgen-props.mjs           verify
 *   node scripts/check-docgen-props.mjs --list    print the census
 */

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.join(ROOT, 'storybook-static/assets');
const INDEX = path.join(ROOT, 'storybook-static/index.json');

/**
 * Things with a docgen record that are not a documented component API. Each
 * needs a reason; an entry that stops being true shows up as an unused
 * exclusion.
 */
const EXCLUDED = {
  isExternalHref: 'A helper function, not a component.',
  useOptionalTheme: 'A hook. Its contract is its JSDoc and the API baseline.',
  NERD_GLYPHS: 'A glyph lookup table, not a component.',
  DesignSandbox: 'Takes no props — it reads the theme context and renders a fixed surface.',
  LoremIpsumPost: 'A fixture used by story files; takes no props by design.',
  TLDR: 'Renders its children under a fixed heading; children is its whole API.',
};

/** Specimen components that live inside the manifesto page and take no props. */
const MANIFESTO_SPECIMENS = [
  'AnsiTarget', 'CodeBlockAttachment', 'DocsLink', 'FormSpecimen', 'HueLadder',
  'LevelDiptych', 'MediumTable', 'RoleLookup', 'SystemFacts', 'VoiceSpecimen',
];
for (const name of MANIFESTO_SPECIMENS) {
  EXCLUDED[name] ??= 'A manifesto specimen — rendered inside one page, takes no props.';
}

function docgenProps() {
  const counts = new Map();
  for (const file of readdirSync(ASSETS)) {
    if (!file.endsWith('.js')) continue;
    const source = readFileSync(path.join(ASSETS, file), 'utf8');
    for (const match of source.matchAll(/displayName:[`"']([A-Za-z0-9_]+)[`"']/g)) {
      const after = source.slice(match.index, match.index + 20000);
      const at = after.indexOf('props:');
      const names =
        at < 0
          ? new Set()
          : new Set(
              [...after.slice(at, at + 20000).matchAll(/(\w+):\{defaultValue/g)].map((m) => m[1]),
            );
      counts.set(match[1], Math.max(counts.get(match[1]) ?? 0, names.size));
    }
  }
  return counts;
}

let index;
try {
  index = JSON.parse(readFileSync(INDEX, 'utf8'));
} catch {
  console.error('No storybook-static/index.json. Run `pnpm build-storybook` first.');
  process.exit(1);
}

/** Component names that own a docs page, from the story index. */
const documented = new Set(
  Object.values(index.entries ?? {})
    .filter((e) => e.type === 'docs')
    .map((e) => e.title.split('/').pop()),
);

const counts = docgenProps();
const bare = [];
const ok = [];

for (const [name, n] of [...counts].sort()) {
  if (EXCLUDED[name]) continue;
  if (n > 0) ok.push(`${name} (${n})`);
  else if (documented.has(name)) bare.push(name);
}

if (process.argv.includes('--list')) {
  console.log(`Documented components with props (${ok.length}):`);
  for (const entry of ok) console.log(`  ${entry}`);
  console.log(`\nExcluded (${Object.keys(EXCLUDED).length}):`);
  for (const [name, why] of Object.entries(EXCLUDED)) console.log(`  ${name} — ${why}`);
  console.log('');
}

console.log(
  `Docgen props OK — ${ok.length} components publish props, ${Object.keys(EXCLUDED).length} excluded with a reason.`,
);

if (bare.length) {
  console.error(`\nDocgen props check failed — ${bare.length} component(s) publish an empty table:\n`);
  for (const name of bare) console.error(`  - ${name}`);
  console.error(
    '\nAn empty props table renders as an empty table and errors nowhere.\n' +
      'Usually a type the extractor cannot resolve — a union, or an intersection from node_modules.\n' +
      'Fix the type, or exclude it with a reason in scripts/check-docgen-props.mjs.',
  );
  process.exit(1);
}
