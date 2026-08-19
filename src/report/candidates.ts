/**
 * Tailwind candidates, read out of finished markup.
 *
 * This is the whole reason the report pipeline can be one pass. Tailwind
 * normally has to *guess* which utilities a build will need, by scanning source
 * text before anything renders — which is why `theme.css` carries `@source "./"`
 * and why a class assembled at runtime as `text-${role}` generates no CSS at
 * all. A report has already rendered by the time we ask, so there is nothing to
 * guess: the class attributes in the HTML are exactly, and only, the utilities
 * the document uses.
 *
 * That makes the emitted CSS both minimal and complete by construction. No
 * `@source` globbing, no safelist, and no arbitrary-value edge case — a
 * `text-[0.75rem]` that a scanner might miss is plainly there in the output.
 */

/** `class="…"` and `class='…'`, which is all `renderToStaticMarkup` emits. */
const CLASS_ATTRIBUTE = /\sclass=(?:"([^"]*)"|'([^']*)')/g;

/**
 * Every distinct class name in `html`.
 *
 * Splitting on whitespace is safe rather than approximate: a Tailwind candidate
 * can never contain a space — arbitrary values encode one as `_`, which is why
 * `grid-cols-[1fr_auto]` is written that way.
 */
export function extractCandidates(html: string): string[] {
  const found = new Set<string>();
  for (const match of html.matchAll(CLASS_ATTRIBUTE)) {
    const value = match[1] ?? match[2] ?? '';
    for (const candidate of value.split(/\s+/)) {
      if (candidate) found.add(candidate);
    }
  }
  return [...found].sort();
}
