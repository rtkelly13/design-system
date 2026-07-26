import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Play, Pause } from 'lucide-react';
import { Button } from '../Button';

export interface SlideDeckProps {
  children: React.ReactElement[];
  aspectRatio?: '16:9' | '4:3';
  autoPlayInterval?: number;
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
        border: '3px solid var(--border-color, #ffffff)',
        boxShadow: isFullscreen ? 'none' : '8px 8px 0px 0px var(--brutalist-shadow-color, #ffffff)',
        backgroundColor: 'var(--color-black, #000000)',
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
          borderTop: '2px solid var(--border-color, #ffffff)',
          backgroundColor: 'var(--color-black, #000000)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace',
        }}
      >
        {/* Slide Counter */}
        <div style={{ color: 'var(--brutalist-yellow, #facc15)', fontWeight: 700, fontSize: '0.9rem' }}>
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
