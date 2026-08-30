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
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `The vocabulary components address instead of colours. A component that names \`--ds-accent-primary\` rethemes on every rung; one that names a hue does not, and \`pnpm lint\` reports the hue at the line that wrote it.

The split that matters is the first two groups, and it is a split of *meaning*, not of palette:

- **\`accent\`** — \`primary\`, \`secondary\`, \`tertiary\`, \`quiet\`. Visual hierarchy: which thing the eye should reach first. A \"NEW\" flash is \`primary\` whether or not anything is wrong.
- **\`intent\`** — \`info\`, \`success\`, \`warning\`, \`danger\`. Communicated meaning the reader must act on. A failed build is \`danger\` however prominent the page wants it.

The remaining three are structural: \`surface\` (elevation), \`text\` (prominence), \`border\` (rule weight).

**From TypeScript**, use \`accentVar()\`, \`surfaceVar()\`, \`textVar()\`, \`borderVar()\` or the \`semanticTokens\` object. **From Tailwind**, use the aliases: \`text-accent-primary\`, \`bg-surface-raised\`, \`border-edge-subtle\`, \`text-intent-danger\`. Where the role arrives as a *prop*, the two are not interchangeable — Tailwind's scanner reads source text, so \`text-\${role}\` generates no CSS at all. Use \`accentTextClass()\` when the accent decides a class and \`accentVar()\` when it decides an inline value.

The legacy hue names (\`cyan\`, \`pink\`, \`yellow\`, \`green\`) still resolve to identical values so existing consumers keep compiling. They are deprecated; do not use them in new code.`,
      },
    },
  },
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

/**
 * Every role with the value it resolves to on the current level. Switching the
 * toolbar re-resolves the whole sheet, which is the claim the layer makes —
 * a component naming a role gets all four rungs for free, and one naming a hue
 * gets one.
 */
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

/**
 * The same roles arriving through component props rather than as swatches,
 * which is how they are actually consumed: `Badge` and `Tag` take an
 * `AccentToken`, `NoteBlock` maps its `type` onto the intent roles internally.
 */
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

/**
 * The distinction the whole layer rests on, put side by side because it is the
 * one that gets confused.
 *
 * Both rows use the same four-step visual weight. The left is `accent` and says
 * *look here first*; the right is `intent` and says *this is what happened*. A
 * failed build is `danger` however quiet the page wants it, and a "NEW" flash
 * is `primary` however alarming it looks. Choosing an accent because it happens
 * to be red is what makes a palette change into a redesign.
 */
export const EmphasisVersusIntent: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr', maxWidth: '640px' }}>
      <div>
        <h3 style={{ fontFamily: 'var(--ds-font-mono)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.75rem', color: semanticTokens.text.secondary }}>
          Accent — hierarchy
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
          <Badge accent="primary">RELEASED</Badge>
          <Badge accent="secondary">SCHEDULED</Badge>
          <Badge accent="tertiary">DRAFTED</Badge>
          <Badge accent="quiet">ARCHIVED</Badge>
        </div>
      </div>
      <div>
        <h3 style={{ fontFamily: 'var(--ds-font-mono)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.75rem', color: semanticTokens.text.secondary }}>
          Intent — meaning
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
          <Badge accent="info">SYNCING</Badge>
          <Badge accent="success">HEALTHY</Badge>
          <Badge accent="warning">DEGRADED</Badge>
          <Badge accent="danger">FAILED</Badge>
        </div>
      </div>
    </div>
  ),
};
