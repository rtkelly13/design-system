import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReportDocument, ReportDetails, ReportSection } from '../report/ReportDocument';
import SampleReport from '../report/sample';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { DataTable } from '../components/DataTable';
import { NoteBlock } from '../components/NoteBlock';
import { StatCard } from '../components/StatCard';

/**
 * The frame the TSX-to-HTML report generator renders into. Reviewing it here is
 * how the generator's output gets reviewed at all — the shipped path writes a
 * static file, so this is the surface the visual suite can pin.
 */
const meta: Meta<typeof ReportDocument> = {
  title: 'Foundations/ReportDocument',
  component: ReportDocument,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof ReportDocument>;

const checks = [
  { check: 'tokens:check', status: 'pass', detail: 'theme.css matches levels.ts' },
  { check: 'check:contrast', status: 'pass', detail: 'all 200 role pairs' },
  { check: 'check:css', status: 'fail', detail: '328 declarations, budget 320' },
];

/** The shape an agent's report actually takes: stats, a table, a note. */
export const QualityGate: Story = {
  args: {
    title: 'Quality Gate',
    subtitle: 'Every gated check, and what the failing one is asking for.',
    meta: [
      { label: 'Generated', value: '2026-08-19' },
      { label: 'Commit', value: 'acf0345' },
      { label: 'Branch', value: 'main' },
    ],
    children: (
      <>
        <ReportSection title="Summary">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard title="Checks" value={11} />
            <StatCard title="Passing" value={10} accent="success" />
            <StatCard title="Failing" value={1} accent="danger" subtitle="check:css" />
          </div>
          <NoteBlock>
            check:css is a ratchet, so it fails on any rise. Lower the budget when you migrate a
            component; never raise it.
          </NoteBlock>
        </ReportSection>
        <ReportSection title="Detail">
          <DataTable
            columns={[
              { header: 'Check', accessor: 'check' },
              {
                header: 'Status',
                accessor: (row: (typeof checks)[number]) => (
                  <Badge accent={row.status === 'pass' ? 'success' : 'danger'}>{row.status}</Badge>
                ),
              },
              { header: 'Detail', accessor: 'detail' },
            ]}
            data={checks}
            keyExtractor={(row) => row.check}
          />
        </ReportSection>
      </>
    ),
  },
};

/**
 * `src/report/sample.tsx`, rendered exactly as `ds-report` renders it.
 *
 * This is the asserted case in the visual suite, and it is the reason the
 * generator's output is reviewable at all: the shipped path writes a static file
 * nobody watches, so a change to the report vocabulary would otherwise only show
 * up in someone's next report. Because it is the same file the render test and
 * the CLI use, a screenshot here covers all three.
 */
export const Sample: StoryObj = {
  render: () => <SampleReport />,
};

/** Progressive disclosure with no client JS — a `<details>`, open and closed. */
export const Disclosure: StoryObj = {
  render: () => (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-8">
      <ReportDetails summary="Open by default" note="3 lines" open>
        <p className="font-mono text-sm text-content-secondary">
          The block a reader came for should not need a click.
        </p>
      </ReportDetails>
      <ReportDetails summary="Folded away" note="200 rows">
        <p className="font-mono text-sm text-content-secondary">Nothing omitted, nothing in the way.</p>
      </ReportDetails>
    </div>
  ),
};

/** Header only — no metadata strip, no subtitle. */
export const Minimal: Story = {
  args: {
    title: 'Link Audit',
    children: (
      <Card>
        <p className="text-content-secondary">No broken links found across 214 documents.</p>
      </Card>
    ),
  },
};
