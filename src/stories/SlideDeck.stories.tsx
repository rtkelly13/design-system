import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SlideDeck } from '../components/slides/SlideDeck';
import { Slide } from '../components/slides/Slide';
import { TLDR } from '../components/TLDR';
import { Badge } from '../components/Badge';

const meta: Meta<typeof SlideDeck> = {
  title: 'Presentation/SlideDeck',
  component: SlideDeck,
};

export default meta;
type Story = StoryObj<typeof SlideDeck>;

export const DefaultDeck: Story = {
  render: () => (
    <SlideDeck>
      <Slide title="WELCOME TO THE SLIDE DECK" subtitle="Brutalist presentation system for talks and decks">
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', fontSize: '1.25rem', color: 'var(--brutalist-yellow, #facc15)' }}>
            Use [LEFT] / [RIGHT] Arrow Keys or Spacebar to Navigate
          </p>
          <div style={{ marginTop: '2rem' }}>
            <Badge accent="green">FULLSCREEN SUPPORT (Press 'F')</Badge>
          </div>
        </div>
      </Slide>

      <Slide title="DUAL-MODE PRESENTATIONS" subtitle="Slides seamlessly follow dark and sketch theme modes">
        <TLDR>
          Presentations rendered with @rtkelly/design-system read perfectly on high-brightness projectors as well as OLED terminal displays.
        </TLDR>
      </Slide>

      <Slide title="SYSTEM COMPLETE" subtitle="Ready for ryankelly.dev talks">
        <div style={{ textAlign: 'center', fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace' }}>
          <p>End of Presentation</p>
        </div>
      </Slide>
    </SlideDeck>
  ),
};
