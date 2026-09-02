import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { SlideDeck } from './SlideDeck';

/**
 * Two of the three defects this component shipped are logic with a right answer
 * independent of pixels, which is this repo's criterion for a unit test rather
 * than a screenshot: which keypresses the deck is entitled to act on, and where
 * `isFullscreen` gets its value. The third — the icon buttons having no
 * accessible name — is now covered by `jsx-a11y` at lint time.
 */

const deck = (autoPlayInterval = 0) => (
  <SlideDeck autoPlayInterval={autoPlayInterval}>
    <div>ONE</div>
    <div>TWO</div>
    <div>THREE</div>
  </SlideDeck>
);

const counter = () => screen.getByText(/SLIDE \d+ \/ \d+/).textContent;

describe('SlideDeck keyboard scope', () => {
  it('advances when the key arrives inside the deck', () => {
    const { container } = render(deck());
    const root = container.querySelector('[aria-roledescription="slide deck"]');
    expect(root).not.toBeNull();

    expect(counter()).toBe('SLIDE 01 / 03');
    fireEvent.keyDown(root as Element, { key: 'ArrowRight' });
    expect(counter()).toBe('SLIDE 02 / 03');
    fireEvent.keyDown(root as Element, { key: 'ArrowLeft' });
    expect(counter()).toBe('SLIDE 01 / 03');
  });

  /**
   * The handler used to be on `window`, so a mounted deck anywhere on the page
   * swallowed Space and both arrow keys everywhere — `preventDefault()` on
   * Space meant the space bar stopped working in every text field on the page.
   */
  it('leaves a text field outside the deck alone', () => {
    render(
      <>
        <input aria-label="Notes" />
        {deck()}
      </>
    );

    const input = screen.getByLabelText('Notes');
    const space = fireEvent.keyDown(input, { key: ' ' });

    // `fireEvent` returns false when a handler called `preventDefault()`.
    expect(space).toBe(true);
    expect(counter()).toBe('SLIDE 01 / 03');

    fireEvent.keyDown(input, { key: 'ArrowRight' });
    expect(counter()).toBe('SLIDE 01 / 03');
  });

  /**
   * Scoping to the container is not enough on its own: the deck's own controls
   * are inside the container, and Space on a focused button must press the
   * button rather than advance the slide.
   */
  it('leaves Space to a focused control inside the deck', () => {
    render(deck());

    const next = screen.getByText('NEXT').closest('button');
    expect(next).not.toBeNull();

    const space = fireEvent.keyDown(next as Element, { key: ' ' });

    expect(space).toBe(true);
    expect(counter()).toBe('SLIDE 01 / 03');
  });
});

describe('SlideDeck fullscreen state', () => {
  afterEach(() => {
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      configurable: true,
    });
  });

  /**
   * `isFullscreen` used to be assigned inside `toggleFullscreen`, so any exit
   * the component did not initiate — pressing Esc, the usual way — left it
   * convinced it was still fullscreen: wrong icon, `100vw` layout, and no way
   * back without a second toggle. It now reads the browser's answer.
   */
  it('follows the browser out of fullscreen', () => {
    const { container } = render(deck());
    const root = container.querySelector('[aria-roledescription="slide deck"]');

    expect(screen.getByLabelText('Enter fullscreen')).toBeDefined();

    Object.defineProperty(document, 'fullscreenElement', {
      value: root,
      configurable: true,
    });
    fireEvent(document, new Event('fullscreenchange'));

    expect(screen.getByLabelText('Exit fullscreen')).toBeDefined();

    // What Esc does: the browser leaves fullscreen without telling the handler.
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      configurable: true,
    });
    fireEvent(document, new Event('fullscreenchange'));

    expect(screen.getByLabelText('Enter fullscreen')).toBeDefined();
  });
});

describe('SlideDeck controls', () => {
  it('gives the icon-only controls an accessible name', () => {
    render(deck(3000));

    expect(screen.getByLabelText('Play slides automatically')).toBeDefined();
    expect(screen.getByLabelText('Enter fullscreen')).toBeDefined();
  });
});
