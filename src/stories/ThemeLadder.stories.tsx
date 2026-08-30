import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ThemeProvider } from '../components/ThemeProvider';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Input } from '../components/Input';
import { Divider } from '../components/Divider';
import { LEVELS, THEME_LEVELS } from '../theme/levels';
import type { ThemeLevel } from '../theme/levels';
import { auditContrast } from '../theme/contrast';

/**
 * The ladder rendered against itself.
 *
 * `AllLevels` is the story worth putting in the *gated* visual suite: it is one
 * screenshot in which a regression on any level shows up. Every other story
 * renders in whichever level the toolbar is set to, so a change that only
 * breaks `white` can pass every one of them.
 *
 * Nothing here lists a level name. Both stories map over `THEME_LEVELS`, so a
 * fifth rung appears in the panel and in the contrast table without this file
 * being touched.
 */
const meta = {
  title: 'Foundations/Theme Ladder',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `Four rungs — \`midnight\`, \`dim\`, \`bright\`, \`white\` — selected by a \`data-theme\` attribute on the root, and **not** a light/dark toggle. Each rung is a designed surface with its own literal colours, so \`dim\` is not a lighter \`midnight\` and \`bright\` is not a dimmer \`white\`.

Everything derives from \`src/theme/levels.ts\`: the generated \`theme.css\`, the runtime provider, the Storybook toolbar above, the walkthrough matrix and the contrast gate. Nothing on this page lists a level name — both stories map over \`THEME_LEVELS\`, so a fifth rung appears here without this file being edited, which is the rule to copy when consuming the ladder.

**Selecting a level.** Set \`data-theme\` on the root for a whole page; wrap a subtree in \`<ThemeProvider scoped>\` for a panel that differs from the page around it. For SSR, render \`getThemeInitScript()\` inline in \`<head>\` — it sets the attribute before first paint, which React cannot do without either a flash or a hydration mismatch.

**Polarity is a declared field, not the axis.** \`LEVELS[x].polarity\` drives \`color-scheme\`, the \`dark:\`/\`light:\` variants and the \`prefers-color-scheme\` mapping. \`dark:\` means \"midnight or dim\" and is for non-colour utilities only — colour comes from the roles, which resolve per level on their own.`,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function LevelPanel({ level }: { level: ThemeLevel }) {
  const definition = LEVELS[level];
  return (
    <ThemeProvider
      scoped
      defaultLevel={level}
      persist={false}
      followSystem={false}
      className="bg-surface-base text-content-primary border-2 border-edge-strong p-6 flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-content-muted">
          {definition.polarity}
        </span>
        <span className="font-display text-2xl font-bold">[ {definition.label} ]</span>
        <span className="text-sm text-content-secondary">{definition.description}</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Badge>v1.1.0</Badge>
        <Button size="sm" bracketed>
          ACTION
        </Button>
      </div>

      <Card title="Raised surface" description="Elevation, border and shadow all follow the level." />

      {/* The mark itself changes with polarity — terminal rule on the dark
          levels, hand-ruled pencil dash on the light ones. */}
      <Divider />

      <Input label="Field" placeholder="Type here" helperText="Helper text uses the muted tone" />

      <div className="flex gap-1">
        {(['primary', 'secondary', 'tertiary', 'quiet'] as const).map((tone) => (
          <span
            key={tone}
            title={`accent.${tone}`}
            className="h-8 flex-1 border-2 border-edge-strong"
            style={{ backgroundColor: definition.accent[tone] }}
          />
        ))}
      </div>
      <div className="flex gap-1">
        {(['info', 'success', 'warning', 'danger'] as const).map((tone) => (
          <span
            key={tone}
            title={`intent.${tone}`}
            className="h-8 flex-1 border-2 border-edge-strong"
            style={{ backgroundColor: definition.intent[tone] }}
          />
        ))}
      </div>
    </ThemeProvider>
  );
}

/**
 * Every level at once, each panel scoped with its own `data-theme`. That the
 * panels differ while the components inside them are identical is the whole
 * claim of the system, made visible.
 */
export const AllLevels: Story = {
  render: () => (
    <div className="grid gap-4 p-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))' }}>
      {THEME_LEVELS.map((level) => (
        <LevelPanel key={level} level={level} />
      ))}
    </div>
  ),
};

/**
 * The gate's own output, rendered. `pnpm check:contrast` fails CI on any row
 * below its minimum; this shows the margin each pair actually has, which is
 * what tells you whether a palette tweak has headroom.
 */
export const ContrastMatrix: Story = {
  render: () => {
    const results = auditContrast(LEVELS);
    return (
      <div className="p-4 font-mono text-xs">
        {THEME_LEVELS.map((level) => {
          const rows = results
            .filter((r) => r.level === level)
            .sort((a, b) => a.ratio - b.ratio)
            .slice(0, 8);
          return (
            <div key={level} className="mb-6">
              <h3 className="font-display text-lg font-bold mb-2">
                [ {LEVELS[level].label} ] tightest 8 of{' '}
                {results.filter((r) => r.level === level).length}
              </h3>
              <table className="w-full border-collapse border-2 border-edge-strong">
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.pair} className="border-b border-edge-subtle">
                      <td className="p-2">{r.pair}</td>
                      <td className="p-2 text-right tabular-nums">{r.ratio.toFixed(2)}:1</td>
                      <td className="p-2 text-right tabular-nums text-content-muted">
                        min {r.minimum}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    );
  },
};

/**
 * A level applied to a subtree instead of the page.
 *
 * `<ThemeProvider scoped>` writes the attribute on a wrapper rather than on the
 * document, so a `bright` panel inside a `midnight` page resolves correctly at
 * any depth — the nested panel below is two levels down and still right.
 *
 * That it works at all is the one genuinely subtle thing in the CSS. A custom
 * property substitutes where it is **declared**, not where it is used, so every
 * `@theme` token that indirects through a per-level variable has to be
 * re-declared inside all four level blocks. An alias left only in `@theme`
 * resolves against the root level, and a panel like this one silently keeps the
 * page\'s colour. `src/theme.css.test.ts` asserts that shape, because
 * `tokens:check` would be equally happy with a generator that reproducibly
 * emitted the wrong one — and a single-level page renders correctly either way,
 * so no screenshot would catch it.
 */
export const ScopedPanels: Story = {
  render: () => (
    <ThemeProvider scoped defaultLevel="midnight" persist={false} followSystem={false}>
      <div className="bg-surface-base text-content-primary" style={{ padding: '2rem' }}>
        <p style={{ fontFamily: 'var(--ds-font-mono)', marginBottom: '1rem' }}>
          Page level: midnight
        </p>
        <Badge accent="primary">OUTER</Badge>

        <ThemeProvider scoped defaultLevel="bright" persist={false} followSystem={false}>
          <div
            className="bg-surface-base text-content-primary border-2 border-edge-strong"
            style={{ padding: '1.5rem', marginTop: '1.5rem' }}
          >
            <p style={{ fontFamily: 'var(--ds-font-mono)', marginBottom: '1rem' }}>
              Scoped panel: bright
            </p>
            <Badge accent="primary">INNER</Badge>

            <ThemeProvider scoped defaultLevel="white" persist={false} followSystem={false}>
              <div
                className="bg-surface-base text-content-primary border-2 border-edge-strong"
                style={{ padding: '1.5rem', marginTop: '1.5rem' }}
              >
                <p style={{ fontFamily: 'var(--ds-font-mono)', marginBottom: '1rem' }}>
                  Nested twice: white
                </p>
                <Badge accent="primary">DEEPEST</Badge>
              </div>
            </ThemeProvider>
          </div>
        </ThemeProvider>
      </div>
    </ThemeProvider>
  ),
};
