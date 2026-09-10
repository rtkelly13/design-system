import type { ReactNode } from 'react';
import { ThemeProvider, useTheme } from '../../components/ThemeProvider';
import { Button } from '../../components/Button';
import { BracketText } from '../../components/BracketText';
import { Prose } from '../../components/docs/Prose';
import { LEVELS } from '../../theme/levels';
import { semanticTokens } from '../../lib/theme';

/**
 * The frame the manifesto renders inside.
 *
 * ## Why this mounts its own provider
 *
 * Storybook's `decorators` wrap *stories*, not the body of an unattached docs
 * page. The `level` toolbar therefore cannot reach this page — nothing on it is
 * a story, so `.storybook/preview.ts`'s decorator never runs and no
 * `data-theme` lands on the iframe's `<html>`. Rather than render at whatever
 * `:root` happens to default to, the page carries a `scoped` provider and its
 * own switch, which is also the honest demonstration: this is the API a
 * consumer mounts, driven by the hook a consumer calls.
 *
 * `persist` is off for the same reason the preview decorator turns it off — a
 * documentation surface must not write the reader's stored site preference.
 */
export function ManifestoPage({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider scoped defaultLevel="midnight" persist={false} followSystem={false}>
      <Frame>{children}</Frame>
    </ThemeProvider>
  );
}

function Frame({ children }: { children: ReactNode }) {
  const { level, levels, setLevel } = useTheme();

  return (
    <div
      className="border-2 border-edge-strong bg-surface-base p-6 text-content-primary sm:p-10"
      style={{ fontFamily: semanticTokens.font.body }}
    >
      <div className="not-prose mb-8 flex flex-wrap items-center justify-between gap-4 border-b-2 border-edge-strong pb-4">
        <span
          className="text-caption font-bold tracking-[0.24em] text-content-muted uppercase"
          style={{ fontFamily: semanticTokens.font.mono }}
        >
          @rtkelly13/design-system
        </span>
        <div className="flex items-center gap-2">
          <span
            className="text-caption tracking-[0.16em] text-content-muted uppercase"
            style={{ fontFamily: semanticTokens.font.mono }}
          >
            level
          </span>
          {levels.map((candidate) => (
            <Button
              key={candidate}
              size="sm"
              bracketed
              variant={candidate === level ? 'primary' : 'inverse'}
              onClick={() => setLevel(candidate)}
              aria-pressed={candidate === level}
            >
              {LEVELS[candidate].label}
            </Button>
          ))}
        </div>
      </div>

      {/*
        `[&_code]` with a trailing `!` is a cascade fix, and the reason is worth
        stating so it is not "tidied" into a `prose-code:` modifier — which is
        what this started as, and it does nothing.

        Storybook maps MDX's tags onto its own styled components, which carry an
        emotion class *on the element*: `.css-xxxx { color: #2e3338 }` for inline
        code. That rule is unlayered, and every Tailwind utility here — including
        everything the typography plugin emits — sits inside a cascade layer. An
        unlayered normal declaration beats a layered one whatever their
        specificity, so inline code rendered near-black on the midnight ground
        and a plain descendant selector at higher specificity still lost.
        `!important` is what outranks an unlayered declaration.

        Two other routes were tried and do not work: `sb-unstyled` guards only
        Storybook's own stylesheet selectors, not a class on the element, and
        passing this package's `mdxComponents` map through
        `parameters.docs.components` does not reach an unattached docs page.
      */}
      <Prose className="max-w-none [&_code]:bg-surface-raised! [&_code]:text-accent-secondary!">
        {children}
      </Prose>
    </div>
  );
}

/**
 * A specimen block. `not-prose` is load-bearing: everything inside is chrome
 * rendered by real components, and the typography plugin's selectors all
 * exclude this class — which is how a component nested in an article escapes
 * the article's list markers and link treatment.
 */
export function Specimen({
  label,
  caption,
  children,
}: {
  label: string;
  caption?: string;
  children: ReactNode;
}) {
  return (
    <section className="not-prose my-8 border-2 border-edge-default bg-surface-raised p-5">
      <h3
        className="text-caption font-bold tracking-[0.18em] uppercase"
        style={{ fontFamily: semanticTokens.font.display }}
      >
        <BracketText accent="secondary">{label}</BracketText>
      </h3>
      {caption && (
        <p
          className="mt-2 mb-5 max-w-[70ch] text-caption text-content-secondary"
          style={{ fontFamily: semanticTokens.font.mono }}
        >
          {caption}
        </p>
      )}
      <div className={caption ? '' : 'mt-5'}>{children}</div>
    </section>
  );
}

/** A row of monospace key/value facts, ruled like the tables in `Prose`. */
export function FactRow({ facts }: { facts: readonly (readonly [string, string])[] }) {
  return (
    <dl
      className="grid gap-x-6 gap-y-2 sm:grid-cols-[max-content_1fr]"
      style={{ fontFamily: semanticTokens.font.mono }}
    >
      {facts.map(([key, value]) => (
        <div key={key} className="contents">
          <dt className="text-caption tracking-[0.1em] text-accent-primary uppercase">{key}</dt>
          <dd className="text-caption text-content-secondary">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
