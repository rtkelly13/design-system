/**
 * Do the code snippets in the docs compile against the published API?
 *
 * `README.md` told consumers to write `<ThemeProvider defaultTheme="dark">` for
 * months. Two bugs in one line: the prop is `defaultLevel`, and `dark` stopped
 * being a level when #123 collapsed the ladder to `midnight` and `sketch`. It
 * was the first thing a new consumer would copy, and nothing could see it —
 * `check:docs` reads these same files but compares *figures*, and a prop name is
 * not a figure.
 *
 * This is the complementary check: every JSX attribute written on a component
 * this package exports must exist on that component's props, and every string
 * literal assigned to a level-typed prop must be a real level.
 *
 * ## What this does not do
 *
 * It is not a typechecker. It does not evaluate the snippets, follow imports, or
 * understand spread props — a gate that claimed to compile prose would be
 * claiming more than it checks. It reads two things it can read exactly: the
 * attribute names on a known component, and the level names anywhere in a fence.
 *
 * Props on host elements (`<main style=…>`) and on components from other
 * packages (`<Link to=…>`) are skipped, because the API baseline says nothing
 * about them.
 *
 *   node scripts/check-doc-snippets.mjs           verify
 *   node scripts/check-doc-snippets.mjs --list    print what it found
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = ['README.md', 'DESIGN.md', 'AGENTS.md', 'CONTEXT.md'];
const API = readFileSync(path.join(ROOT, 'api/index.d.ts'), 'utf8');

/** Level names, read from the source rather than repeated here. */
const LEVELS = [
  ...readFileSync(path.join(ROOT, 'src/theme/levels.ts'), 'utf8')
    .match(/export const THEME_LEVELS = \[([^\]]*)\]/)[1]
    .matchAll(/'([a-z]+)'/g),
].map((m) => m[1]);

/**
 * Props declared for each exported component, from the API baseline.
 *
 * The baseline is the right source: it is what a consumer installs, it is
 * already gated by `check:api`, and reading it means this check cannot disagree
 * with that one.
 */
function declaredProps() {
  const byInterface = new Map();
  for (const m of API.matchAll(/(?:interface|type) (\w*Props)\b[^{]*\{([\s\S]*?)\n\}/g)) {
    const props = [...m[2].matchAll(/^\s{4}(\w+)\??:/gm)].map((p) => p[1]);
    byInterface.set(m[1], props);
  }
  // `declare function Foo(props: FooProps)` / `const Foo: FC<FooProps>`
  const byComponent = new Map();
  for (const m of API.matchAll(/declare (?:function|const) (\w+)[^;\n]*?(\w+Props)/g)) {
    const [, comp, iface] = m;
    if (byInterface.has(iface)) byComponent.set(comp, byInterface.get(iface));
  }
  for (const [iface, props] of byInterface) {
    const comp = iface.replace(/Props$/, '');
    if (!byComponent.has(comp)) byComponent.set(comp, props);
  }
  return byComponent;
}

const COMPONENTS = declaredProps();
const problems = [];
const seen = [];

for (const file of DOCS) {
  const text = readFileSync(path.join(ROOT, file), 'utf8');
  for (const fence of text.matchAll(/```(?:tsx|jsx)\n([\s\S]*?)```/g)) {
    const snippet = fence[1];
    const line0 = text.slice(0, fence.index).split('\n').length;

    for (const tag of snippet.matchAll(/<([A-Z]\w+)((?:\s+[^<>]*?)?)\/?>/g)) {
      const [, name, attrs] = tag;
      const props = COMPONENTS.get(name);
      if (!props) continue; // not ours — nothing to check it against
      const at = line0 + snippet.slice(0, tag.index).split('\n').length - 1;

      for (const attr of attrs.matchAll(/(?:^|\s)([a-zA-Z][\w-]*)=/g)) {
        const prop = attr[1];
        if (prop.includes('-') || prop.startsWith('aria') || prop.startsWith('data')) continue;
        seen.push(`${file}:${at} <${name} ${prop}>`);
        if (!props.includes(prop)) {
          problems.push(
            `${file}:${at} — <${name}> has no prop \`${prop}\`. Declared: ${props.join(', ') || '(none)'}`
          );
        }
      }

      // A level named as a string literal must be a level.
      for (const lit of attrs.matchAll(/([a-zA-Z]*(?:[Ll]evel|[Tt]heme))="([a-z]+)"/g)) {
        if (!LEVELS.includes(lit[2])) {
          problems.push(
            `${file}:${at} — <${name} ${lit[1]}="${lit[2]}"> is not a level. Levels are: ${LEVELS.join(', ')}`
          );
        }
      }
    }
  }
}

if (process.argv.includes('--list')) {
  console.log(`Levels: ${LEVELS.join(', ')}`);
  console.log(`Components with declared props: ${COMPONENTS.size}`);
  for (const s of seen) console.log(`  ${s}`);
}

if (problems.length) {
  console.error(`Documentation snippets disagree with the published API — ${problems.length} problem(s):\n`);
  for (const p of problems) console.error(`  - ${p}`);
  console.error('\nThe snippets are the first thing a consumer copies. Fix the doc, or the API.');
  process.exit(1);
}

console.log(`Doc snippets OK — ${seen.length} props checked across ${DOCS.length} documents.`);
