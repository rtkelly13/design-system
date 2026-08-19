import type { Meta, StoryObj } from '@storybook/react-vite';
import { semanticTokens } from '../lib/theme';
import { Badge } from '../components/Badge';
import { Tag } from '../components/Tag';
import { NoteBlock } from '../components/NoteBlock';

/**
 * Reference for the semantic layer. Components should address these roles
 * rather than the raw brutalist palette, so a retheme is a change to
 * `theme.css` alone.
 */
const meta: Meta = {
  title: 'Foundations/Semantic Tokens',
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <span
        style={{
          width: '2.5rem',
          height: '2.5rem',
          flex: 'none',
          backgroundColor: value,
          border: `2px solid ${semanticTokens.border.strong}`,
        }}
      />
      <span
        style={{
          fontFamily: semanticTokens.font.mono,
          fontSize: '0.8rem',
          color: semanticTokens.text.secondary,
        }}
      >
        {name}
      </span>
    </div>
  );
}

function Group({ title, entries }: { title: string; entries: Record<string, string> }) {
  return (
    <section style={{ marginBottom: '2rem' }}>
      <h3
        style={{
          fontFamily: semanticTokens.font.display,
          fontSize: '0.8rem',
          fontWeight: 800,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: semanticTokens.accent.secondary,
          marginBottom: '0.75rem',
        }}
      >
        [ {title} ]
      </h3>
      <div style={{ display: 'grid', gap: '0.6rem' }}>
        {Object.entries(entries).map(([name, value]) => (
          <Swatch key={name} name={name} value={value} />
        ))}
      </div>
    </section>
  );
}

export const Roles: Story = {
  render: () => (
    <div style={{ maxWidth: '640px', color: semanticTokens.text.primary }}>
      <Group title="Accent — visual hierarchy" entries={semanticTokens.accent} />
      <Group title="Intent — communicated meaning" entries={semanticTokens.intent} />
      <Group title="Surface — elevation" entries={semanticTokens.surface} />
      <Group title="Text — prominence" entries={semanticTokens.text} />
      <Group title="Border — rule weight" entries={semanticTokens.border} />
    </div>
  ),
};

export const AppliedToComponents: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '640px' }}>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Badge accent="primary">PRIMARY</Badge>
        <Badge accent="secondary">SECONDARY</Badge>
        <Badge accent="tertiary">TERTIARY</Badge>
        <Badge accent="quiet">QUIET</Badge>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Tag text="info" accent="info" />
        <Tag text="success" accent="success" />
        <Tag text="warning" accent="warning" />
        <Tag text="danger" accent="danger" />
      </div>

      <NoteBlock type="note">Intent roles survive a retheme; hue names do not.</NoteBlock>
      <NoteBlock type="warning">Legacy palette names still resolve identically.</NoteBlock>
    </div>
  ),
};
