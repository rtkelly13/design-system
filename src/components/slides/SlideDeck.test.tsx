import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SlideDeck } from './SlideDeck';
import { Slide } from './Slide';

/**
 * `Slide.speakerNotes` was accepted and rendered nowhere (#94). These cover the
 * two halves of making it honest: the notes surface when asked for, and a deck
 * without them is unchanged — the second being the one that could regress a
 * baseline without anyone noticing.
 */
function deckWithNotes() {
  return render(
    <SlideDeck>
      <Slide title="ONE" speakerNotes="Notes for the first slide.">
        <p>First</p>
      </Slide>
      <Slide title="TWO" speakerNotes="Notes for the second slide.">
        <p>Second</p>
      </Slide>
      <Slide title="THREE">
        <p>Third</p>
      </Slide>
    </SlideDeck>,
  );
}

function deckWithoutNotes() {
  return render(
    <SlideDeck>
      <Slide title="ONE">
        <p>First</p>
      </Slide>
      <Slide title="TWO">
        <p>Second</p>
      </Slide>
    </SlideDeck>,
  );
}

const notesToggle = () => screen.queryByLabelText(/speaker notes/i);

describe('SlideDeck presenter notes', () => {
  it('offers no notes control when no slide has notes', () => {
    deckWithoutNotes();
    expect(notesToggle()).toBeNull();
  });

  it('leaves N inert on a deck with no notes', () => {
    const { container } = deckWithoutNotes();
    const before = container.innerHTML;
    fireEvent.keyDown(window, { key: 'n' });
    expect(container.innerHTML).toBe(before);
  });

  it('offers the control when some slide has notes, closed to begin with', () => {
    deckWithNotes();
    expect(notesToggle()).not.toBeNull();
    expect(screen.queryByText(/Notes for the first slide/)).toBeNull();
  });

  it('opens and closes on the control', () => {
    deckWithNotes();
    fireEvent.click(notesToggle() as HTMLElement);
    expect(screen.getByText(/Notes for the first slide/)).toBeTruthy();
    fireEvent.click(notesToggle() as HTMLElement);
    expect(screen.queryByText(/Notes for the first slide/)).toBeNull();
  });

  it('opens on N', () => {
    deckWithNotes();
    fireEvent.keyDown(window, { key: 'n' });
    expect(screen.getByText(/Notes for the first slide/)).toBeTruthy();
  });

  it('follows the current slide', () => {
    deckWithNotes();
    fireEvent.keyDown(window, { key: 'n' });
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText(/Notes for the second slide/)).toBeTruthy();
    expect(screen.queryByText(/Notes for the first slide/)).toBeNull();
  });

  it('says so on a slide with no notes rather than closing the panel', () => {
    deckWithNotes();
    fireEvent.keyDown(window, { key: 'n' });
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText(/No notes on this slide/)).toBeTruthy();
  });

  it('treats whitespace-only notes as no notes', () => {
    // Two slides because `children` is typed as an array — a one-slide deck is
    // a type error, which is deliberate: the deck indexes its children.
    render(
      <SlideDeck>
        <Slide title="ONE" speakerNotes="   ">
          <p>First</p>
        </Slide>
        <Slide title="TWO">
          <p>Second</p>
        </Slide>
      </SlideDeck>,
    );
    expect(notesToggle()).toBeNull();
  });
});
