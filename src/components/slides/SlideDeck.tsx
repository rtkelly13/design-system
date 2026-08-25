import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Play, Pause } from 'lucide-react';
import { Button } from '../Button';

export interface SlideDeckProps {
  children: React.ReactElement[];
  aspectRatio?: '16:9' | '4:3';
  autoPlayInterval?: number;
}

/**
 * Anything that wants the key itself. The deck listens on its own container
 * rather than on `window`, so a keypress only reaches it while focus is inside
 * the deck — but the deck's own controls are inside it too, and Space on a
 * focused button must press the button, not advance the slide.
 */
const INTERACTIVE =
  'a[href], button, input, textarea, select, [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

function wantsTheKeyItself(target: EventTarget | null, container: HTMLElement): boolean {
  if (!(target instanceof Element)) return false;
  const owner = target.closest(INTERACTIVE);
  return owner !== null && owner !== container;
}

export const SlideDeck: React.FC<SlideDeckProps> = ({
  children,
  aspectRatio = '16:9',
  autoPlayInterval = 0,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSlides = React.Children.count(children);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
  }, [totalSlides]);

  /**
   * Ask the browser to change; do not record the answer here. `isFullscreen` is
   * set from the `fullscreenchange` event below, because the browser can leave
   * fullscreen without going through this function — Esc is the common way, and
   * setting the flag here left the component convinced it was still fullscreen
   * with the wrong icon and a `100vw` layout it could not get out of.
   */
  const toggleFullscreen = useCallback(() => {
    const node = containerRef.current;
    if (!node) return;
    if (document.fullscreenElement === node) {
      void document.exitFullscreen().catch((err: unknown) => console.error(err));
    } else {
      void node.requestFullscreen().catch((err: unknown) => console.error(err));
    }
  }, []);

  useEffect(() => {
    const sync = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  /**
   * Scoped to the deck, not to `window`.
   *
   * On `window` this handler ran while any deck was mounted anywhere on the
   * page, never checked `event.target`, and called `preventDefault()` on Space
   * — so the space bar stopped working in every text field on the page, and the
   * arrow keys were swallowed the same way. Listening on the container means
   * the keys only act once focus is inside the deck, which is also what makes
   * `tabIndex={0}` on it worth having.
   */
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (wantsTheKeyItself(event.target, node)) return;

      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault();
        nextSlide();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prevSlide();
      } else if (event.key === 'f' || event.key === 'F') {
        toggleFullscreen();
      }
    };

    node.addEventListener('keydown', handleKeyDown);
    return () => node.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, toggleFullscreen]);

  useEffect(() => {
    if (!isPlaying || autoPlayInterval <= 0) return;
    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isPlaying, autoPlayInterval, nextSlide]);

  const slideList = React.Children.toArray(children);

  return (
    <div
      ref={containerRef}
      role="group"
      aria-roledescription="slide deck"
      aria-label={`Slide deck, ${String(totalSlides)} slides`}
      tabIndex={0}
      style={{
        width: '100%',
        maxWidth: isFullscreen ? '100vw' : '1000px',
        margin: '0 auto',
        border: '3px solid var(--ds-border-strong)',
        boxShadow: isFullscreen ? 'none' : '8px 8px 0px 0px var(--ds-shadow-color)',
        backgroundColor: 'var(--ds-surface-base)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Slide viewport */}
      <div
        style={{
          width: '100%',
          aspectRatio: isFullscreen ? 'auto' : (aspectRatio === '16:9' ? '16 / 9' : '4 / 3'),
          flex: isFullscreen ? 1 : 'none',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {slideList[currentSlide]}
      </div>

      {/* Control bar */}
      <div
        style={{
          padding: '1rem 1.5rem',
          borderTop: '2px solid var(--ds-border-strong)',
          backgroundColor: 'var(--ds-surface-base)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace',
        }}
      >
        {/* Slide Counter */}
        <div style={{ color: 'var(--ds-accent-secondary)', fontWeight: 700, fontSize: '0.9rem' }}>
          SLIDE {String(currentSlide + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Button onClick={prevSlide} style={{ padding: '0.4rem 0.8rem' }}>
            <ChevronLeft size={16} /> PREV
          </Button>

          {autoPlayInterval > 0 && (
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? 'Pause automatic advance' : 'Play slides automatically'}
              style={{ padding: '0.4rem 0.8rem' }}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </Button>
          )}

          <Button onClick={nextSlide} style={{ padding: '0.4rem 0.8rem' }}>
            NEXT <ChevronRight size={16} />
          </Button>

          <Button
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            style={{ padding: '0.4rem 0.8rem' }}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </Button>
        </div>
      </div>
    </div>
  );
};
