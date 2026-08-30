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
 * `autoPlayInterval` in milliseconds offers a play control that advances the
 * deck on its own, wrapping at the end — right for a kiosk or a lobby screen,
 * wrong for a talk, where the presenter owns the pacing. At `0`, the default,
 * the control is not rendered at all, so a deck that does not want autoplay
 * gains no chrome from the prop existing.
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

/**
 * Presenter notes. Press **`N`** — or the notes control that has appeared in
 * the bar, which no other deck on this page has — to open the panel below the
 * frame; it follows the current slide, and the third slide deliberately has no
 * notes so the empty case is visible too.
 *
 * Notes live on the `Slide`, not on the deck. An array of notes indexed by
 * position would put the two halves of one fact in different places and
 * misalign the moment a slide is inserted.
 *
 * Off by default and below the viewport rather than over it: a deck mirrored to
 * a projector shows the audience the slide and nothing else.
 */
export const WithSpeakerNotes: Story = {
  render: () => (
    <SlideDeck>
      <Slide
        title="ADOPT, DO NOT MANAGE"
        subtitle="Import before the first apply"
        speakerNotes="Open on the incident: a plan proposed deleting a live domain because the resource was declared but never imported. Nobody applied it — but nobody could tell at a glance that they shouldn't."
      >
        <p>Adoption cannot delete what it does not own.</p>
      </Slide>

      <Slide
        title="ONE STACK, THREE MODES"
        subtitle="Declared once, resolved per environment"
        speakerNotes="Don't read the table out. The only number worth saying aloud is that this replaced three per-repo copies."
      >
        <p>Identity, domains and env vars live in one place; repos own how they build.</p>
      </Slide>

      <Slide title="QUESTIONS">
        <p>No notes on this one — the panel says so rather than disappearing.</p>
      </Slide>
    </SlideDeck>
  ),
};
