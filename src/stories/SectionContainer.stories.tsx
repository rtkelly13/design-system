import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SectionContainer } from '../components/SectionContainer';

const meta: Meta<typeof SectionContainer> = {
  title: 'Foundations/SectionContainer',
  component: SectionContainer,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof SectionContainer>;

/**
 * A width-and-gutter wrapper, so what it does is only visible against the
 * viewport edge — the dashed outline here is the story's, not the component's.
 */
export const Default: Story = {
  render: () => (
    <SectionContainer>
      <div style={{ outline: '1px dashed currentColor', padding: '2rem' }}>
        Content sits inside the measured column; the dashed edge marks where it starts.
      </div>
    </SectionContainer>
  ),
};

/**
 * The measure doing its job. The column stops well short of the viewport at
 * wide sizes, which is the whole reason this component exists — line length,
 * not layout.
 */
export const LongProse: Story = {
  render: () => (
    <SectionContainer>
      <p style={{ lineHeight: 1.7 }}>
        {'Constrained measure keeps lines readable. '.repeat(12)}
      </p>
    </SectionContainer>
  ),
};

/**
 * What it does *not* do, which is the more useful thing to know. The measure is
 * chosen for prose, so a wide table or a dashboard grid put inside it is
 * cropped to a reading column. Those belong outside — the second block here is
 * the same table with no container around it.
 */
export const WhenNotToUseIt: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <SectionContainer>
        <div style={{ outline: '1px dashed currentColor', overflowX: 'auto', padding: '1rem' }}>
          <div style={{ width: '1400px' }}>A 1400px-wide table inside the measure: it scrolls.</div>
        </div>
      </SectionContainer>
      <div style={{ outline: '1px dashed currentColor', padding: '1rem' }}>
        <div style={{ width: '100%' }}>The same content outside it: full viewport width.</div>
      </div>
    </div>
  ),
};
