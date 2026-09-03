import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SlideDeck } from './SlideDeck';

/**
 * `SlideDeck` had no tests, and could not usefully have had any: it owned the
 * slide index in state and advanced it on a timer, so the only way to observe
 * slide 3 was to press a button twice. Every assertion below depends on the
 * index being addressable — which is the point of the change, stated as tests.
 */

const deck = (props: Record<string, unknown> = {}) =>
  render(
    <SlideDeck {...props}>
      <div>ALPHA</div>
      <div>BETA</div>
      <div>GAMMA</div>
    </SlideDeck>,
  );

const shown = () => {
  for (const label of ['ALPHA', 'BETA', 'GAMMA']) {
    if (screen.queryByText(label)) return label;
  }
  return null;
};

describe('SlideDeck — uncontrolled (the existing behaviour)', () => {
  it('starts on the first slide', () => {
    deck();
    expect(shown()).toBe('ALPHA');
  });

  it('advances and wraps at the end', () => {
    deck();
    fireEvent.click(screen.getByText(/NEXT/));
    expect(shown()).toBe('BETA');
    fireEvent.click(screen.getByText(/NEXT/));
    expect(shown()).toBe('GAMMA');
    fireEvent.click(screen.getByText(/NEXT/));
    expect(shown()).toBe('ALPHA');
  });

  it('goes back, wrapping to the last slide from the first', () => {
    deck();
    fireEvent.click(screen.getByText(/PREV/));
    expect(shown()).toBe('GAMMA');
  });

  it('still reports where it moved to', () => {
    const onSlideChange = vi.fn();
    deck({ onSlideChange });
    fireEvent.click(screen.getByText(/NEXT/));
    expect(onSlideChange).toHaveBeenCalledWith(1);
  });

  it('is driven by the arrow keys', () => {
    deck();
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(shown()).toBe('BETA');
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(shown()).toBe('ALPHA');
  });
});

describe('SlideDeck — controlled', () => {
  it('renders the slide it is given, without any navigation', () => {
    // The assertion that was previously impossible: slide 2, directly.
    deck({ slide: 2 });
    expect(shown()).toBe('GAMMA');
  });

  it('does not move itself — the caller owns the index', () => {
    const onSlideChange = vi.fn();
    deck({ slide: 0, onSlideChange });

    fireEvent.click(screen.getByText(/NEXT/));

    expect(onSlideChange).toHaveBeenCalledWith(1);
    expect(shown()).toBe('ALPHA');
  });

  it('follows the prop when it changes', () => {
    const { rerender } = deck({ slide: 0 });
    expect(shown()).toBe('ALPHA');
    rerender(
      <SlideDeck slide={1}>
        <div>ALPHA</div>
        <div>BETA</div>
        <div>GAMMA</div>
      </SlideDeck>,
    );
    expect(shown()).toBe('BETA');
  });

  it('reports a wrapped index rather than an out-of-range one', () => {
    const onSlideChange = vi.fn();
    deck({ slide: 2, onSlideChange });
    fireEvent.click(screen.getByText(/NEXT/));
    expect(onSlideChange).toHaveBeenCalledWith(0);
  });
});

describe('SlideDeck — chrome', () => {
  it('renders the control bar by default', () => {
    deck();
    expect(screen.queryByText(/NEXT/)).not.toBeNull();
    expect(screen.queryByText(/SLIDE 01/)).not.toBeNull();
  });

  it('drops the control bar when chrome is off, keeping the slide', () => {
    deck({ chrome: false, slide: 1 });
    expect(shown()).toBe('BETA');
    expect(screen.queryByText(/NEXT/)).toBeNull();
    expect(screen.queryByText(/SLIDE/)).toBeNull();
  });

  it('stops listening for arrow keys when chrome is off', () => {
    // A deck embedded in a page that owns its own keyboard must not also
    // silently consume the arrow keys.
    const onSlideChange = vi.fn();
    deck({ chrome: false, onSlideChange });
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(onSlideChange).not.toHaveBeenCalled();
    expect(shown()).toBe('ALPHA');
  });
});

describe('SlideDeck — edges', () => {
  it('survives an empty deck', () => {
    // Previously `prevSlide` sent the index to -1 here, which indexed nothing.
    const onSlideChange = vi.fn();
    render(<SlideDeck onSlideChange={onSlideChange}>{[]}</SlideDeck>);
    fireEvent.click(screen.getByText(/PREV/));
    expect(onSlideChange).not.toHaveBeenCalled();
  });

  it('handles a single-slide deck without moving', () => {
    // Written as an explicit array because `children` is typed
    // `React.ReactElement[]`, so a lone JSX child does not satisfy it even
    // though `React.Children.count` handles one fine. Widening that type is a
    // separate change and not what this issue is about.
    render(<SlideDeck>{[<div key="only">ONLY</div>]}</SlideDeck>);
    fireEvent.click(screen.getByText(/NEXT/));
    expect(screen.queryByText('ONLY')).not.toBeNull();
  });
});
