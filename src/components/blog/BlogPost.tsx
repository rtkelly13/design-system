import React from 'react';
import { Calendar, Clock, User, Tag as TagIcon } from 'lucide-react';
import { PageTitle } from '../PageTitle';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { AsciiDivider } from '../AsciiDivider';

export interface BlogPostProps {
  /** Article title, rendered through `PageTitle`. */
  title: string;
  /** Standfirst under the title. */
  subtitle?: string;
  /** Byline. Defaults to `'Ryan Kelly'` — override it for a guest post. */
  author?: string;
  /** Publication date, rendered as given. Format it at the call site. */
  date: string;
  /**
   * Reading time. Defaults to `'5 min read'`, which is a *placeholder rather
   * than a measurement* — pass the real figure, because the default is
   * confidently wrong for a long article.
   */
  readingTime?: string;
  /**
   * Topic tags in the header. Also defaulted to a sample set
   * (`Engineering`/`Design System`/`Architecture`), so an article that omits
   * them silently claims three it may not have. Pass `[]` for none.
   */
  tags?: string[];
  /** The article body. Wrap Markdown output in `Prose`; bare tags are unstyled outside it. */
  children: React.ReactNode;
}

/**
 * The editorial article shell: title, byline row, tags, rule, body.
 *
 * It composes `PageTitle`, `Badge` and `Divider` into the standard post header
 * so every article on the site agrees about where the date sits. The body is
 * yours — it applies no typography of its own, so Markdown output should be
 * wrapped in `Prose` inside it.
 *
 * Note the two defaults that are content rather than configuration:
 * `readingTime` and `tags` both have plausible-looking placeholder values, so a
 * post that does not pass them renders a claim nobody made. Treat both as
 * required in real use.
 *
 * ```tsx
 * <BlogPost title="Where a theme stops applying" date="2026-08-11"
 *           readingTime="9 min read" tags={['CSS', 'Design systems']}>
 *   <Prose>{content}</Prose>
 * </BlogPost>
 * ```
 */
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
