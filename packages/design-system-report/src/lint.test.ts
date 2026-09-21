import { describe, expect, it } from 'vitest';
import { formatProblems, lintReport } from './lint';

const problemsFor = (source: string) => lintReport(source).map((p) => `${p.severity}:${p.rule}`);

describe('lintReport', () => {
  it('passes a report written against roles', () => {
    expect(
      lintReport(`<div className="bg-surface-raised text-content-primary border-edge-subtle" />`),
    ).toEqual([]);
  });

  it.each([
    ['hex literal', 'style={{ color: "#22d3ee" }}', 'error:hex'],
    ['palette utility', '<div className="bg-zinc-900" />', 'error:rawPalette'],
    ['legacy alias', '<p className="text-brutalist-cyan" />', 'error:legacyAlias'],
    ['dark: colour', '<p className="dark:text-white" />', 'error:darkVariant'],
  ])('flags a %s as an error', (_label, source, expected) => {
    expect(problemsFor(source)).toContain(expected);
  });

  it.each([
    ['new Date()', 'const now = new Date();'],
    ['Date.now()', 'const now = Date.now();'],
    ['Math.random()', 'const id = Math.random();'],
  ])('warns about %s, which makes the output differ between runs', (_label, source) => {
    expect(problemsFor(source)).toEqual(['warning:nondeterministic']);
  });

  /**
   * The distinction the rule turns on: a date the author wrote down is fixed,
   * and is the right way to stamp a report. Only the zero-argument form varies.
   */
  it('accepts a Date built from a literal', () => {
    expect(lintReport(`const at = new Date('2026-08-19');`)).toEqual([]);
  });

  it('warns about behaviour that cannot run in a static document', () => {
    expect(problemsFor('<button onClick={go}>Go</button>')).toEqual(['warning:inert']);
    expect(problemsFor('const [open, setOpen] = useState(false);')).toEqual(['warning:inert']);
  });

  /**
   * Both of these were false negatives, found by running the rule over this
   * package's own components and checking the answer against the source rather
   * than trusting it. Rules match a trimmed line, so a handler is routinely at
   * index 0 with no whitespace in front of it; and a hook called with an
   * explicit type argument has no `(` after its name.
   */
  it('catches a handler at the start of a line', () => {
    expect(problemsFor('onClick={onCopy}')).toEqual(['warning:inert']);
  });

  it('catches a hook called with a type argument', () => {
    expect(problemsFor('const [o, setO] = useState<Record<string, boolean>>({});')).toEqual([
      'warning:inert',
    ]);
  });

  /** `button` ends in no word boundary before `on`, so this is not a handler. */
  it('does not mistake a word ending in on for a handler', () => {
    expect(lintReport('const buttonClick={handler};')).toEqual([]);
  });

  /** `useMemo` and `useId` both do their work during the captured render. */
  it('leaves render-time hooks alone', () => {
    expect(lintReport('const id = useId(); const rows = useMemo(build, []);')).toEqual([]);
  });

  /**
   * Comments name the forbidden patterns constantly — this file does it a dozen
   * times, and so do the rules' own `fix` strings. Without the skip the linter's
   * first finding would be its own documentation.
   */
  it('ignores comment lines', () => {
    expect(lintReport('// never write #ff0000 or bg-zinc-900 here')).toEqual([]);
    expect(lintReport(' * Avoid #ff0000 in a report.')).toEqual([]);
  });

  it('sorts errors before warnings, then by line', () => {
    const source = ['const now = Date.now();', '', '<div className="bg-zinc-900" />'].join('\n');
    expect(problemsFor(source)).toEqual(['error:rawPalette', 'warning:nondeterministic']);
  });
});

describe('formatProblems', () => {
  it('groups by rule so one fix is printed once, not once per hit', () => {
    const output = formatProblems(
      'r.tsx',
      lintReport('<div className="bg-zinc-900 text-cyan-400 border-red-500" />'),
    );
    expect(output).toContain('Literal Tailwind palette utilities (3)');
    expect(output.match(/Use the semantic utilities/g)).toHaveLength(1);
    expect(output).toContain('r.tsx:1');
  });
});
