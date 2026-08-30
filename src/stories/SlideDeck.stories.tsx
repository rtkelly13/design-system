import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SlideDeck } from '../components/slides/SlideDeck';
import { Slide } from '../components/slides/Slide';
import { TLDR } from '../components/TLDR';
import { Badge } from '../components/Badge';

const meta: Meta<typeof SlideDeck> = {
  title: 'Presentation/SlideDeck',
  tags: ['autodocs'],
  component: SlideDeck,
};

export default meta;
type Story = StoryObj<typeof SlideDeck>;

/**
 * Three slides with the default `16:9` frame. Arrow keys and space page through
 * it, `F` goes fullscreen, and next from the last slide wraps to the first —
 * the deck owns all of that so a `Slide` never has to.
 */
export const DefaultDeck: Story = {
  render: () => (
    <SlideDeck>
      <Slide title="WELCOME TO THE SLIDE DECK" subtitle="Brutalist presentation system for talks and decks">
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', fontSize: '1.25rem', color: 'var(--ds-accent-secondary)' }}>
            Use [LEFT] / [RIGHT] Arrow Keys or Spacebar to Navigate
          </p>
          <div style={{ marginTop: '2rem' }}>
            <Badge accent="green">FULLSCREEN SUPPORT (Press 'F')</Badge>
          </div>
        </div>
      </Slide>

      <Slide title="DUAL-MODE PRESENTATIONS" subtitle="Slides follow every level of the theme ladder">
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

/**
 * `aspectRatio="4:3"` — for print handouts and older projectors. The deck owns
 * the frame shape so individual `Slide`s never have to: the same slides render
 * in either ratio without being written twice.
 */
export const FourThree: Story = {
  render: () => (
    <SlideDeck aspectRatio="4:3">
      <Slide title="ONE STACK, THREE MODES" subtitle="Adopt, do not manage">
        <p>Import existing resources before the first apply.</p>
      </Slide>
      <Slide title="CONFIRM DEPLOY" subtitle="A proposed domain deletion is a registry bug">
        <p>Read the plan before applying it.</p>
      </Slide>
    </SlideDeck>
  ),
};

/**
 * `autoPlayInterval` in milliseconds starts the deck advancing on its own and
 * wrapping at the end — right for a kiosk or a lobby screen, wrong for a talk,
 * where the presenter owns the pacing. `0`, the default, does not hide the play
 * control: a reader can still start it themselves.
 */
export const Autoplay: Story = {
  render: () => (
    <SlideDeck autoPlayInterval={3000}>
      <Slide title="SLIDE ONE"><p>Advances after three seconds.</p></Slide>
      <Slide title="SLIDE TWO"><p>And again.</p></Slide>
      <Slide title="SLIDE THREE"><p>Then wraps back to the first.</p></Slide>
    </SlideDeck>
  ),
};
