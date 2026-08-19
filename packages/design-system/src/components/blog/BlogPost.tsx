import React from 'react';
import { Calendar, Clock, User, Tag as TagIcon } from 'lucide-react';
import { PageTitle } from '../PageTitle';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { AsciiDivider } from '../AsciiDivider';

export interface BlogPostProps {
  title: string;
  subtitle?: string;
  author?: string;
  date: string;
  readingTime?: string;
  tags?: string[];
  children: React.ReactNode;
}

export const BlogPost: React.FC<BlogPostProps> = ({
  title,
  subtitle,
  author = 'Ryan Kelly',
  date,
  readingTime = '5 min read',
  tags = ['Engineering', 'Design System', 'Architecture'],
  children,
}) => {
  return (
    <article
      style={{
        maxWidth: '840px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        color: 'var(--color-white, #ffffff)',
      }}
    >
      {/* Blog Post Header */}
      <header style={{ marginBottom: '2.5rem' }}>
        <PageTitle subtitle={subtitle} bracketed>
          {title}
        </PageTitle>

        {/* Metadata Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            padding: '1rem 0',
            borderTop: '2px solid var(--border-color, #ffffff)',
            borderBottom: '2px solid var(--border-color, #ffffff)',
            fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace',
            fontSize: '0.85rem',
            color: 'var(--brutalist-cyan, #22d3ee)',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <User size={15} />
            <span>{author}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={15} />
            <span>{date}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={15} />
            <span>{readingTime}</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
            {tags.map((t) => (
              <Badge key={t} accent="cyan">
                #{t}
              </Badge>
            ))}
          </div>
        </div>
      </header>

      {/* Main Narrative Body */}
      <div
        style={{
          fontFamily: 'var(--font-inter, "Inter"), sans-serif',
          fontSize: '1.125rem',
          lineHeight: 1.8,
        }}
      >
        {children}
      </div>

      <AsciiDivider />

      {/* Author Bio Footer */}
      <footer style={{ marginTop: '3rem' }}>
        <Card style={{ borderColor: 'var(--brutalist-cyan, #22d3ee)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'var(--brutalist-cyan, #22d3ee)',
                color: '#000000',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif',
              }}
            >
              RK
            </div>
            <div>
              <h4 style={{ fontFamily: 'var(--font-space-grotesk, "Space Grotesk"), sans-serif', margin: 0, fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase' }}>
                Written by {author}
              </h4>
              <span style={{ fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', fontSize: '0.8rem', color: 'var(--brutalist-yellow, #facc15)' }}>
                ryankelly.dev • Systems Architecture & Brutalist UI
              </span>
            </div>
          </div>
        </Card>
      </footer>
    </article>
  );
};
