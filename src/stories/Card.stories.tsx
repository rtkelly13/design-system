import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';

const meta: Meta<typeof Card> = {
  title: 'Foundations/Card',
  component: Card,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

/**
 * The implicit panel: no `panel` prop and no `title`, so the component picks the
 * panel form from the presence of children. Convenient, and the reason `panel`
 * is worth passing explicitly — a card that later gains a title silently
 * becomes the full card form instead.
 */
export const Default: Story = {
  render: () => (
    <Card style={{ maxWidth: '400px' }}>
      <Badge accent="cyan">v1.1.0 ACTIVE</Badge>
      <h3 style={{ fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif', fontSize: '1.25rem', margin: '0.75rem 0' }}>
        BRUTALIST CONTAINER
      </h3>
      <p style={{ fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
        Zero border-radius with 4px hard offset shadow.
      </p>
      <Button bracketed variant="cyan">DETAILS</Button>
    </Card>
  ),
};

/**
 * The panel form, which is the one to reach for by default: a bordered box with
 * padding, an optional accent stripe on the left edge and a badge. No filename
 * bar, no width constraint, no opinion about what goes inside.
 */
export const Panel: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '1rem', maxWidth: '420px' }}>
      <Card panel accent="info" badge="DRAFT" title="Scoped themes" description="A panel is a box with a stripe." />
      <Card panel accent="success" badge="SHIPPED" title="Contrast gate" description="The stripe is the whole colour budget." />
    </div>
  ),
};

/**
 * The full card form, selected by passing a `title`: a filename bar across the
 * top, then title, description and a trailing `[ Learn More → ]` when `href` is
 * set. It carries its own width and float classes, so it belongs in a card grid
 * rather than standing alone in a layout you control.
 *
 * The shape being chosen by the *presence of a prop* is the trap worth knowing:
 * a panel that later gains a title silently becomes this. Pass `panel`
 * explicitly to opt out.
 */
export const FullCard: Story = {
  render: () => (
    <Card
      title="Where a theme stops applying"
      description="A custom property substitutes where it is declared, not where it is used."
      href="#article"
      asciiArt="[///]"
      accent="primary"
    />
  ),
};
