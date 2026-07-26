import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
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
