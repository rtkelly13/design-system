/**
 * The contrast audit, as a report.
 *
 * `pnpm check:contrast` answers yes or no and `pnpm contrast:report` prints 200
 * rows to a terminal. Neither is much use when the question is *which pair is
 * closest to failing on which rung*, which is the question anyone touching a
 * level colour actually has.
 *
 *   pnpm report reports/contrast.tsx --theme white
 *
 * This is also the dogfood: the first report in this repo written the way the
 * generator expects one to be written. Two things it demonstrates that
 * `sample.tsx` cannot, because the sample is fixed data by design:
 *
 *   1. **A report can compute.** `auditContrast` runs during the render, so this
 *      is the audit rather than a picture of one. Nothing is passed in and
 *      nothing is stale.
 *   2. **Determinism survives real data**, because the data is derived from
 *      `levels.ts` rather than from a clock or the filesystem. That is the
 *      distinction the `nondeterministic` lint rule is really drawing.
 *
 * Repo-local: `reports/` is not in `files`, so this ships nowhere.
 */

import {
  Badge,
  Card,
  DataTable,
  NoteBlock,
  ReportDetails,
  ReportDocument,
  ReportSection,
  StatCard,
  LEVELS,
  THEME_LEVELS,
  auditContrast,
  type ContrastCheck,
  type ThemeLevel,
} from '@rtkelly13/design-system';

const CHECKS = auditContrast(LEVELS);
const FAILING = CHECKS.filter((check) => !check.passes);

/** How much headroom a pair has. Negative is a failure, near-zero is a warning. */
const margin = (check: ContrastCheck) => check.ratio - check.minimum;

const byMargin = (a: ContrastCheck, b: ContrastCheck) => margin(a) - margin(b);
const tightest = [...CHECKS].sort(byMargin);

const forLevel = (level: ThemeLevel) => CHECKS.filter((check) => check.level === level);

/** Two swatches over each other, so a ratio is legible as well as numeric. */
function Swatch({ check }: { check: ContrastCheck }) {
  return (
    <span
      className="inline-flex items-center border-2 border-edge-strong px-2 py-0.5 font-mono text-xs"
      style={{ backgroundColor: check.background, color: check.foreground }}
    >
      Aa
    </span>
  );
}

function Ratio({ check }: { check: ContrastCheck }) {
  const headroom = margin(check);
  const tone = !check.passes ? 'danger' : headroom < 0.5 ? 'warning' : 'success';
  return (
    <span className="flex items-center justify-end gap-2 tabular-nums">
      <span className="text-content-secondary">{check.ratio.toFixed(2)}</span>
      <Badge accent={tone}>{headroom >= 0 ? `+${headroom.toFixed(2)}` : headroom.toFixed(2)}</Badge>
    </span>
  );
}

const COLUMNS = [
  { header: 'Pair', accessor: 'pair' as const },
  { header: 'Sample', accessor: (check: ContrastCheck) => <Swatch check={check} /> },
  { header: 'Needs', accessor: (check: ContrastCheck) => check.minimum.toFixed(1), className: 'text-right' },
  { header: 'Ratio / margin', accessor: (check: ContrastCheck) => <Ratio check={check} />, className: 'text-right' },
];

const key = (check: ContrastCheck) => `${check.level}:${check.pair}`;

export default function ContrastReport() {
  return (
    <ReportDocument
      title="Contrast Audit"
      subtitle="Every text-on-surface and border-on-surface pair, on every rung of the ladder."
      meta={[
        { label: 'Source', value: <code>src/theme/levels.ts</code> },
        { label: 'Pairs', value: CHECKS.length },
        { label: 'Levels', value: THEME_LEVELS.length },
        { label: 'Gate', value: <code>pnpm check:contrast</code> },
      ]}
    >
      <ReportSection title="Summary">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <StatCard title="Pairs" value={CHECKS.length} />
          <StatCard title="Passing" value={CHECKS.length - FAILING.length} accent="success" />
          <StatCard
            title="Failing"
            value={FAILING.length}
            accent={FAILING.length ? 'danger' : 'quiet'}
          />
          <StatCard
            title="Tightest"
            value={`+${margin(tightest[0] as ContrastCheck).toFixed(2)}`}
            accent="warning"
            subtitle={tightest[0]?.level}
          />
        </div>
        <NoteBlock type="note" title="Why literals, not color-mix">
          Every level colour is written out rather than derived, because percentages tuned against
          near-black do not hold at the light end — and because literals make this audit possible
          without a browser.
        </NoteBlock>
      </ReportSection>

      <ReportSection title="Closest to failing">
        <Card>
          <p className="mb-4 text-content-secondary">
            The ten pairs with the least headroom, across all rungs. These are the ones a change to
            a level colour will break first.
          </p>
          <DataTable
            columns={[{ header: 'Level', accessor: 'level' as const }, ...COLUMNS]}
            data={tightest.slice(0, 10)}
            keyExtractor={key}
          />
        </Card>
      </ReportSection>

      <ReportSection title="By level">
        {THEME_LEVELS.map((level) => {
          const rows = [...forLevel(level)].sort(byMargin);
          const failing = rows.filter((check) => !check.passes).length;
          return (
            <ReportDetails
              key={level}
              summary={`${level} — ${LEVELS[level].polarity}`}
              note={failing ? `${failing} failing` : `${rows.length} pairs, all passing`}
              open={failing > 0}
            >
              <DataTable columns={COLUMNS} data={rows} keyExtractor={key} />
            </ReportDetails>
          );
        })}
      </ReportSection>
    </ReportDocument>
  );
}
