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
        color: 'var(--ds-text-primary)',
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
            borderTop: '2px solid var(--ds-border-strong)',
            borderBottom: '2px solid var(--ds-border-strong)',
            fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace',
            fontSize: '0.85rem',
            color: 'var(--ds-accent-primary)',
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
        <Card style={{ borderColor: 'var(--ds-accent-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'var(--ds-accent-primary)',
                color: 'var(--ds-text-inverse)',
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
              <span style={{ fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono"), monospace', fontSize: '0.8rem', color: 'var(--ds-accent-secondary)' }}>
                ryankelly.dev • Systems Architecture & Brutalist UI
              </span>
            </div>
          </div>
        </Card>
      </footer>
    </article>
  );
};
