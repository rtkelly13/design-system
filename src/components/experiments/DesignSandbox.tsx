import React, { useState } from 'react';
import { PageTitle } from '../PageTitle';
import { Card } from '../Card';
import { Button } from '../Button';
import { Badge } from '../Badge';
import { NoteBlock } from '../NoteBlock';
import { TLDR } from '../TLDR';
import { AsciiDivider } from '../AsciiDivider';
import { SlideDeck } from '../slides/SlideDeck';
import { Slide } from '../slides/Slide';
import { LoremIpsumPost } from '../blog/LoremIpsumPost';
import { useTheme } from '../ThemeProvider';
import { Sun, Moon, Sparkles, Terminal } from 'lucide-react';

export const DesignSandbox: React.FC = () => {
  const { theme, cycleTheme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'components' | 'slides' | 'post'>('components');

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        color: 'var(--color-white, #ffffff)',
      }}
    >
      {/* Sandbox Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <PageTitle subtitle="Interactive Brutalist Component Playground & Theme Matrix" bracketed>
            DESIGN SYSTEM SANDBOX
          </PageTitle>
        </div>

        {/* 3-Way Theme Switcher Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--color-black, #000000)', padding: '0.5rem', border: '2px solid var(--border-color, #ffffff)' }}>
          {(['dark', 'dim', 'sketch'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              style={{
                fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '0.4rem 0.8rem',
                border: '2px solid var(--border-color, #ffffff)',
                backgroundColor: theme === t ? 'var(--brutalist-cyan, #22d3ee)' : 'transparent',
                color: theme === t ? '#000000' : 'var(--color-white, #ffffff)',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid var(--border-color, #ffffff)', paddingBottom: '0.75rem' }}>
        <Button onClick={() => setActiveTab('components')} variant={activeTab === 'components' ? 'pink' : 'default'} bracketed>
          COMPONENTS
        </Button>
        <Button onClick={() => setActiveTab('slides')} variant={activeTab === 'slides' ? 'pink' : 'default'} bracketed>
          PRESENTATION DECK
        </Button>
        <Button onClick={() => setActiveTab('post')} variant={activeTab === 'post' ? 'pink' : 'default'} bracketed>
          LOREM IPSUM BLOG POST
        </Button>
      </div>

      {/* Tab 1: Core Components Grid */}
      {activeTab === 'components' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Card Primitives */}
          <Card>
            <h3 style={{ fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif', fontSize: '1.25rem', fontWeight: 800, color: 'var(--brutalist-cyan, #22d3ee)', marginBottom: '1rem' }}>
              [ CARD & BADGE PRIMITIVES ]
            </h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <Badge accent="cyan">CYAN BADGE</Badge>
              <Badge accent="pink">PINK BADGE</Badge>
              <Badge accent="yellow">YELLOW BADGE</Badge>
              <Badge accent="green">NEON GREEN</Badge>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Button variant="cyan" bracketed>PRIMARY ACTION</Button>
              <Button variant="pink" bracketed>ACCENT ACTION</Button>
              <Button onClick={cycleTheme} bracketed>TOGGLE THEME: {theme.toUpperCase()}</Button>
            </div>
          </Card>

          {/* Callouts */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif', fontSize: '1.25rem', fontWeight: 800, color: 'var(--brutalist-yellow, #facc15)' }}>
              [ CALLOUT & ALERT PRIMITIVES ]
            </h3>
            <TLDR>
              Executive summary callouts highlight high-priority takeaways with bold yellow borders and hard shadows.
            </TLDR>

            <NoteBlock type="note" title="NEON TERMINAL NOTE">
              Standard technical notes resolve with neon cyan accents in dark mode and re-map to rich blue pen ink in sketch mode.
            </NoteBlock>

            <NoteBlock type="warning" title="SYSTEM ALERTS">
              Warnings display pink accents to demand immediate visual attention.
            </NoteBlock>
          </div>

        </div>
      )}

      {/* Tab 2: Slide Presentation Deck */}
      {activeTab === 'slides' && (
        <div>
          <h3 style={{ fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif', fontSize: '1.25rem', fontWeight: 800, color: 'var(--brutalist-cyan, #22d3ee)', marginBottom: '1.5rem' }}>
            [ BRUTALIST SLIDE DECK ENGINE ]
          </h3>

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

            <Slide title="THANK YOU" subtitle="Built for ryankelly.dev and all project surfaces">
              <div style={{ textAlign: 'center' }}>
                <Button bracketed variant="pink">EXPLORE DESIGN SYSTEM</Button>
              </div>
            </Slide>
          </SlideDeck>
        </div>
      )}

      {/* Tab 3: Lorem Ipsum Blog Post */}
      {activeTab === 'post' && (
        <div>
          <LoremIpsumPost />
        </div>
      )}

    </div>
  );
};
