import React from 'react';
import { Beaker, Boxes, Palette, Type, Sparkles, Projector, Terminal } from 'lucide-react';
import { PageTitle } from '../PageTitle';
import { Badge } from '../Badge';

export interface ExperimentItem {
  id: string;
  name: string;
  description: string;
  icon?: React.ReactNode;
  status: 'active' | 'archived' | 'experimental';
  componentCount: number;
}

export const DEFAULT_EXPERIMENTS: ExperimentItem[] = [
  {
    id: 'component-library',
    name: 'Component Library',
    description: 'Every core primitive component rendered across the full theme ladder, side by side',
    icon: <Boxes size={36} color="var(--ds-accent-primary)" />,
    status: 'active',
    componentCount: 8,
  },
  {
    id: 'design-sandbox',
    name: 'Design System Sandbox',
    description: 'Interactive component variations, theme toggles, and live presentation playground',
    icon: <Palette size={36} color="var(--ds-accent-tertiary)" />,
    status: 'active',
    componentCount: 12,
  },
  {
    id: 'typography-proposals',
    name: 'Editorial Typography Proposals',
    description: 'Three-role font pairings (Space Grotesk + Inter + IBM Plex Mono + VT323)',
    icon: <Type size={36} color="var(--ds-accent-secondary)" />,
    status: 'active',
    componentCount: 4,
  },
  {
    id: 'presentation-decks',
    name: 'Brutalist Slide Decks',
    description: 'Keyboard-navigated presentation deck engine with fullscreen support',
    icon: <Projector size={36} color="var(--ds-intent-success)" />,
    status: 'active',
    componentCount: 6,
  },
  {
    id: 'graphics-generators',
    name: 'Graphics Generators',
    description: 'Seed-driven SVG background and hero graphics generators for talks',
    icon: <Sparkles size={36} color="var(--ds-accent-primary)" />,
    status: 'active',
    componentCount: 5,
  },
];

export interface ExperimentsViewProps {
  onSelectExperiment?: (id: string) => void;
}

export const ExperimentsView: React.FC<ExperimentsViewProps> = ({ onSelectExperiment }) => {
  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        color: 'var(--ds-text-primary)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Beaker size={40} color="var(--ds-accent-primary)" />
        <PageTitle subtitle="Interactive prototypes, design systems, and creative explorations" bracketed>
          EXPERIMENTS & LABS
        </PageTitle>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
        {DEFAULT_EXPERIMENTS.map((exp) => (
          <div
            key={exp.id}
            /*
             * A card that selects an experiment is a control, and it cannot be
             * a `<button>`: its content is flow content — nested divs — which a
             * button may not contain. So it carries the button role explicitly
             * and honours the keyboard contract that role promises, rather than
             * a bare click handler no keyboard can reach. With no handler
             * passed it is not a control at all, and takes neither.
             */
            role={onSelectExperiment ? 'button' : undefined}
            tabIndex={onSelectExperiment ? 0 : undefined}
            onClick={onSelectExperiment ? () => onSelectExperiment(exp.id) : undefined}
            onKeyDown={
              onSelectExperiment
                ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelectExperiment(exp.id);
                    }
                  }
                : undefined
            }
            className="bg-surface-raised text-content-primary border-2 border-edge-strong shadow-hard-md p-6 transition-[transform,box-shadow] duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--ds-accent-primary)] motion-reduce:transition-none motion-reduce:hover:translate-x-0 motion-reduce:hover:translate-y-0"
            style={{
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'center',
              cursor: onSelectExperiment ? 'pointer' : 'default',
            }}
          >
            <div>{exp.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.4rem' }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    margin: 0,
                    color: 'var(--ds-text-primary)',
                  }}
                >
                  {exp.name}
                </h3>
                <Badge accent={exp.status === 'active' ? 'cyan' : 'yellow'}>{exp.status.toUpperCase()}</Badge>
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace',
                  fontSize: '0.875rem',
                  color: 'var(--ds-text-primary)',
                  opacity: 0.8,
                  margin: 0,
                }}
              >
                {exp.description}
              </p>
              <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', color: 'var(--ds-accent-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Terminal size={14} />
                <span>{exp.componentCount} primitives contained</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
