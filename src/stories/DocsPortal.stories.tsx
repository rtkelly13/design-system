import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { BookOpen } from 'lucide-react';
import { AnchorHeading } from '../components/docs/AnchorHeading';
import { Breadcrumbs } from '../components/docs/Breadcrumbs';
import { CodeBlock } from '../components/docs/CodeBlock';
import { DocPager } from '../components/docs/DocPager';
import { DocsHeader } from '../components/docs/DocsHeader';
import { DocsLayout } from '../components/docs/DocsLayout';
import { DocsSidebar } from '../components/docs/DocsSidebar';
import { Prose } from '../components/docs/Prose';
import { TableOfContents } from '../components/docs/TableOfContents';
import type { DocsNavNode } from '../components/docs/DocsSidebar';
import type { TocEntry } from '../components/docs/TableOfContents';
import { NoteBlock } from '../components/NoteBlock';

const meta: Meta = {
  title: 'Docs/Portal',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `The documentation kit assembled into the page it exists to build — \`DocsLayout\` holding a \`DocsHeader\`, a \`DocsSidebar\`, a \`TableOfContents\` and a \`Prose\` body with \`Breadcrumbs\`, \`AnchorHeading\`, \`CodeBlock\` and \`DocPager\` inside it.

It is here because the parts have contracts with each other that no single component page can show: the sidebar's open state lives in the *caller*, and both the header's toggle and the layout's scrim read it, so a portal that forgets to thread \`sidebarOpen\` through both has a drawer that opens and cannot be closed. That wiring is what the first story demonstrates.

The other thing to take from it is \`not-prose\`. Chrome rendered inside the article — the breadcrumb above the title, the pager below the body — must carry it, or the typography plugin's descendant selectors style it as prose. Every \`Docs/*\` component that is meant to sit inside \`Prose\` already applies it internally; anything you add yourself does not.

Each part has its own page with its own props table. This one is the composition.`,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const NAV: DocsNavNode[] = [
  { label: 'Overview', href: '/docs' },
  { label: 'Getting Started', href: '/docs/start' },
  {
    label: 'CLI',
    href: '/docs/cli',
    items: [
      { label: 'Introspection', href: '/docs/cli/introspection' },
      { label: 'Queue', href: '/docs/cli/queue' },
      { label: 'Graph', href: '/docs/cli/graph' },
    ],
  },
  {
    label: 'Architecture',
    items: [
      { label: 'Sync', href: '/docs/architecture/sync' },
      { label: 'Database', href: '/docs/architecture/db' },
      {
        label: 'Scraping',
        href: '/docs/architecture/scraping',
        items: [{ label: 'Browser Sessions', href: '/docs/architecture/scraping/browser' }],
      },
    ],
  },
  { label: 'Changelog', href: '/docs/changelog', defaultCollapsed: true },
];

const TOC: TocEntry[] = [
  { id: 'overview', title: 'Overview', depth: 2 },
  { id: 'installation', title: 'Installation', depth: 2 },
  { id: 'package-manager', title: 'Package manager', depth: 3 },
  { id: 'verifying', title: 'Verifying the install', depth: 3 },
  { id: 'configuration', title: 'Configuration', depth: 2 },
];

function SampleBody() {
  return (
    <Prose>
      <Breadcrumbs
        items={[
          { label: 'Docs', href: '/docs' },
          { label: 'CLI', href: '/docs/cli' },
          { label: 'Introspection' },
        ]}
      />

      <AnchorHeading level={1} id="cli-introspection" anchor={false}>
        CLI Introspection
      </AnchorHeading>

      <p>
        Every heading on this page owns a <code>#slug</code> anchor. Hover one and the
        trailing control copies an absolute link straight to that section.
      </p>

      <AnchorHeading level={2} id="overview">
        Overview
      </AnchorHeading>
      <p>
        Discover the command tree safely, and choose between nearby command surfaces
        without guessing. Prefer <code>--json</code> for agent-facing callers.
      </p>

      <NoteBlock type="tip" title="Agent mode">
        Machine-readable output is a first-class surface, not an afterthought.
      </NoteBlock>

      <AnchorHeading level={2} id="installation">
        Installation
      </AnchorHeading>

      <AnchorHeading level={3} id="package-manager">
        Package manager
      </AnchorHeading>
      <CodeBlock title="terminal" language="bash">
        <code>{`uv sync\nuv run tvs --help`}</code>
      </CodeBlock>

      <ul>
        <li>Unordered lists take an accent marker.</li>
        <li>
          Inline <code>code</code> keeps the mono treatment.
        </li>
      </ul>

      <AnchorHeading level={3} id="verifying">
        Verifying the install
      </AnchorHeading>
      <table>
        <thead>
          <tr>
            <th>Command</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>tvs help</code>
            </td>
            <td>Top-level discovery</td>
          </tr>
          <tr>
            <td>
              <code>tvs metadata</code>
            </td>
            <td>Full machine-readable command tree</td>
          </tr>
        </tbody>
      </table>

      <AnchorHeading level={2} id="configuration">
        Configuration
      </AnchorHeading>
      <blockquote>
        <p>Keep root instructions small, stable, and pointer-based.</p>
      </blockquote>

      <DocPager
        prev={{ label: 'Getting Started', href: '/docs/start' }}
        next={{ label: 'Queue Workflow', href: '/docs/cli/queue' }}
      />
    </Prose>
  );
}

/**
 * The whole kit wired together, including the part no single component page can
 * show: the drawer's open state lives here, in the caller, and is threaded into
 * both `DocsHeader` (for the toggle and its `aria-expanded`) and `DocsLayout`
 * (for the scrim). A portal that passes it to only one has a drawer that opens
 * and cannot be closed.
 */
export const FullPortal: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <DocsLayout
        sidebarOpen={open}
        onCloseSidebar={() => setOpen(false)}
        header={
          <DocsHeader
            title="TVS Docs"
            icon={BookOpen}
            nav={[
              { label: 'Docs', href: '/docs', active: true },
              { label: 'CLI', href: '/docs/cli' },
              { label: 'GitHub', href: 'https://github.com' },
            ]}
            onSearch={() => undefined}
            onToggleSidebar={() => setOpen((v) => !v)}
            sidebarOpen={open}
          />
        }
        sidebar={
          <DocsSidebar
            nav={NAV}
            currentPath="/docs/cli/introspection"
            onNavigate={() => setOpen(false)}
          />
        }
        toc={<TableOfContents toc={TOC} spy={false} />}
      >
        <SampleBody />
      </DocsLayout>
    );
  },
};

/**
 * The article without the chrome — what an MDX page compiles to inside `Prose`.
 * The breadcrumb and the pager are inside the scope and carry `not-prose`,
 * which is what stops the typography plugin styling them as article content.
 */
export const ProseOnly: Story = {
  render: () => (
    <div style={{ padding: '2rem' }}>
      <SampleBody />
    </div>
  ),
};

/**
 * The two navigation rails side by side. They answer different questions —
 * `DocsSidebar` is where you are in the *site*, `TableOfContents` is where you
 * are in the *page* — which is why a docs layout carries both rather than
 * merging them.
 */
export const Navigation: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', padding: '2rem' }}>
      <DocsSidebar nav={NAV} currentPath="/docs/architecture/scraping/browser" />
      <TableOfContents toc={TOC} spy={false} />
    </div>
  ),
};
