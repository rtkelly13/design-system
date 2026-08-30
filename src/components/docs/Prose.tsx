import type { HTMLAttributes, ReactNode } from 'react';
import { recipe } from '../../lib/recipe';

/**
 * Typography scope for compiled Markdown/MDX output.
 *
 * Everything a Markdown pipeline emits — `ul`, `table`, `blockquote`, inline
 * `code` — arrives as bare HTML with no class names, so there is nothing for a
 * utility to attach to. `@tailwindcss/typography` exists for precisely that,
 * and `prose-ladder` (in `prose.css`) points its `--tw-prose-*` variables at
 * this system's role tokens, so prose follows the theme ladder with no per-level
 * rules of its own.
 *
 * The recipe below is the **delta** between the plugin's defaults and this
 * system: display headings in uppercase, rules under h1 and h2, hard-edged code
 * chips, mono tables, square list markers. Element modifiers (`prose-h1:`,
 * `prose-table:`) are the plugin's own mechanism for exactly this, so the
 * styling lives on the element as utilities and no descendant CSS is authored.
 *
 * ## Nesting chrome inside an article
 *
 * A breadcrumb above the page title and a pager below the body both read as
 * part of the article, so they get rendered inside this scope — and used to need
 * ~70 declarations of reset in `prose.css` to stop them inheriting list markers
 * and the prose link treatment. The plugin has a designed escape hatch for that:
 * every selector it generates excludes `.not-prose` subtrees. Chrome carries
 * that class and the whole reset block goes away.
 */

const prose = recipe({
  base: [
    'prose prose-ladder max-w-[var(--docs-content-max)]',
    // `prose.css` promises to work without Tailwind's preflight, so the
    // border-box reset cannot be assumed here.
    'box-border [&_*]:box-border',
  ],
  variants: {
    /** The house style. Off only for a preview that wants plugin defaults. */
    brutalist: {
      true: [
        // Headings: display face, uppercase, heavy — and a hierarchy of rules
        // rather than a hierarchy of sizes alone.
        'prose-headings:font-display prose-headings:font-extrabold prose-headings:uppercase prose-headings:tracking-[0.01em]',
        'prose-h1:border-b-4 prose-h1:border-double prose-h1:border-edge-strong prose-h1:pb-3',
        'prose-h2:border-b-2 prose-h2:border-solid prose-h2:border-edge-strong prose-h2:pb-1.5',
        'prose-h3:text-accent-primary prose-h4:text-accent-secondary',

        // Links invert on hover rather than changing shade — the same move
        // Button makes, so the article and the chrome agree.
        'prose-a:underline prose-a:decoration-2 prose-a:underline-offset-[3px]',
        'prose-a:hover:bg-accent-primary prose-a:hover:text-content-inverse prose-a:hover:no-underline',

        // Square markers, native rather than drawn: `list-[square]` is a real
        // marker, so it takes --tw-prose-bullets and needs no ::before.
        'prose-ul:list-[square]',
        'prose-ol:marker:font-mono prose-ol:marker:font-bold',

        // Inline code as a hard-edged chip. `pre > code` is untouched — the code
        // block owns that.
        'prose-code:border prose-code:border-edge-default prose-code:bg-surface-raised',
        'prose-code:px-[0.35rem] prose-code:py-[0.1rem] prose-code:before:content-none prose-code:after:content-none',

        'prose-blockquote:border-l-4 prose-blockquote:bg-surface-raised prose-blockquote:px-5 prose-blockquote:py-3',
        'prose-hr:border-t-2 prose-hr:border-dashed prose-hr:opacity-50',
        'prose-img:border-2 prose-img:border-edge-strong',
        'prose-kbd:border-2 prose-kbd:border-edge-strong prose-kbd:shadow-hard-sm',

        // Tables are data, so they read in mono at a tighter size, with every
        // cell ruled rather than only the header.
        'prose-table:border-2 prose-table:border-edge-strong prose-table:font-mono prose-table:text-[0.85rem]',
        'prose-thead:bg-surface-raised',
        'prose-th:border-2 prose-th:border-edge-strong prose-th:uppercase prose-th:tracking-[0.04em] prose-th:text-accent-primary',
        'prose-td:border-2 prose-td:border-edge-default prose-td:align-top',
      ],
    },
  },
  defaultVariants: {
    brutalist: true,
  },
});

export interface ProseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  /**
   * The article. Bare tags from a Markdown pipeline are what this is for —
   * anything already carrying its own classes should be marked `not-prose` so
   * the typography plugin's descendant selectors skip it.
   */
  children: ReactNode;
  /**
   * Apply the house typography on top of the plugin's defaults. Turn off only
   * to preview what the tokens alone produce.
   */
  brutalist?: boolean;
  /**
   * Extra classes on the scope. Merged through the recipe, so a caller's
   * `max-w-*` genuinely replaces the measure rather than racing it.
   */
  className?: string;
}

/**
 * The typography scope to wrap compiled Markdown in.
 *
 * Reach for it whenever content arrives as bare HTML — an MDX page, a
 * changelog, a rendered README. Nothing else in the package styles raw tags:
 * outside this scope an `<h2>` from a Markdown pipeline is an unstyled `<h2>`,
 * which is the deliberate consequence of styling living on elements rather than
 * in a stylesheet.
 *
 * Two things to know before nesting anything in it. First, the typography
 * plugin is an **optional peer dependency** — a consumer importing `prose.css`
 * must have `@tailwindcss/typography` installed, where a `theme.css`-only
 * consumer need not. Second, chrome rendered *inside* an article — a breadcrumb
 * above the title, a pager below the body — must carry `not-prose`, or it
 * inherits list markers and the prose link treatment.
 *
 * ```tsx
 * <Prose>
 *   <Breadcrumbs className="not-prose" items={trail} />
 *   <MDXContent />
 * </Prose>
 * ```
 */

export function Prose({ children, brutalist = true, className = '', ...rest }: ProseProps) {
  return (
    <div className={prose({ brutalist, class: className })} {...rest}>
      {children}
    </div>
  );
}

export default Prose;
