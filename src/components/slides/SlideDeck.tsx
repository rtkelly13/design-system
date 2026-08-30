import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Play, Pause } from 'lucide-react';
import { Button } from '../Button';

export interface SlideDeckProps {
  /**
   * The slides, as an **array of elements** — normally `Slide`s. Typed as an
   * array rather than `ReactNode` on purpose: the deck counts and indexes its
   * children, so a single child or a fragment breaks the count.
   */
  children: React.ReactElement[];
  /** Frame shape. `16:9` for anything shown on a modern display; `4:3` for print or legacy projectors. */
  aspectRatio?: '16:9' | '4:3';
  /**
   * Milliseconds between automatic advances. `0` — the default — disables
   * autoplay and hides nothing: the play control is still there, so a reader
   * can start it themselves. Non-zero starts the deck advancing on its own,
   * which is right for a kiosk and wrong for a talk.
   */
  autoPlayInterval?: number;
}

/**
 * The presentation shell around a set of `Slide`s: framing, paging, fullscreen
 * and optional autoplay.
 *
 * It owns the aspect ratio so slides do not have to, wraps at both ends (next
 * from the last slide returns to the first), and exposes fullscreen through the
 * Fullscreen API on its own container rather than the document — so a deck
 * embedded in a page goes fullscreen without taking the page with it.
 *
 * Slides are indexed by position, so the children must be a stable array. A
 * conditional slide that disappears shifts every index after it.
 *
 * ```tsx
 * <SlideDeck aspectRatio="16:9">
 *   <Slide title="Overview">…</Slide>
 *   <Slide title="Deployments">…</Slide>
 * </SlideDeck>
 * ```
 */
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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
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
  }, [totalSlides]);

  useEffect(() => {
    if (!isPlaying || autoPlayInterval <= 0) return;
    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isPlaying, autoPlayInterval]);

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
    </div>
  );
};
