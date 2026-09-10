import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Play, Pause } from 'lucide-react';
import { Button } from '../Button';

export interface SlideDeckProps {
  children: React.ReactElement[];
  aspectRatio?: '16:9' | '4:3';
  autoPlayInterval?: number;
  /**
   * The slide to show. Pass it to drive the deck from outside — a router, a
   * story, a frame renderer — and the deck stops owning the index. Omit it and
   * the deck keeps its own, which is the existing behaviour.
   *
   * The deck holding the index is why it could not previously be screenshotted
   * at a chosen slide, deep-linked, or driven by anything but a person.
   */
  slide?: number;
  /** Fires with the slide the deck wants to move to, controlled or not. */
  onSlideChange?: (slide: number) => void;
  /**
   * The presenter affordances — control bar, arrow keys, fullscreen. On by
   * default. Turn them off for a surface that already owns its own navigation,
   * or that has no person in front of it at all.
   */
  chrome?: boolean;
}

export const SlideDeck: React.FC<SlideDeckProps> = ({
  children,
  aspectRatio = '16:9',
  autoPlayInterval = 0,
  slide,
  onSlideChange,
  chrome = true,
}) => {
  // Only consulted when uncontrolled. `slide` winning outright is what keeps a
  // controlled deck from ever disagreeing with its caller.
  const [uncontrolledSlide, setUncontrolledSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSlides = React.Children.count(children);
  const isControlled = slide !== undefined;
  const currentSlide = isControlled ? slide : uncontrolledSlide;

  const goTo = useCallback(
    (next: number) => {
      // Guarded rather than left to the modulo: an empty deck used to send
      // `prevSlide` to -1, which indexed nothing and rendered blank.
      if (totalSlides === 0) return;
      const wrapped = ((next % totalSlides) + totalSlides) % totalSlides;
      if (!isControlled) setUncontrolledSlide(wrapped);
      onSlideChange?.(wrapped);
    },
    [isControlled, onSlideChange, totalSlides],
  );

  const nextSlide = useCallback(
    () => goTo(currentSlide + 1),
    [goTo, currentSlide],
  );
  const prevSlide = useCallback(
    () => goTo(currentSlide - 1),
    [goTo, currentSlide],
  );

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    if (!chrome) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // Previously `[totalSlides]`, which closed over stale nav functions. That
    // worked only because they touched nothing but the state updater; the
    // moment one read a prop it would have stopped.
  }, [chrome, nextSlide, prevSlide, toggleFullscreen]);

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

      {/* Control bar — the presenter affordances, off when `chrome` is false. */}
      {chrome && (
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
            <Button onClick={() => setIsPlaying(!isPlaying)} style={{ padding: '0.4rem 0.8rem' }}>
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </Button>
          )}

          <Button onClick={nextSlide} style={{ padding: '0.4rem 0.8rem' }}>
            NEXT <ChevronRight size={16} />
          </Button>

          <Button onClick={toggleFullscreen} style={{ padding: '0.4rem 0.8rem' }}>
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </Button>
        </div>
      </div>
      )}
    </div>
  );
};
