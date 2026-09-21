import { describe, expect, it } from 'vitest';
import { extractCandidates } from './candidates';

describe('extractCandidates', () => {
  it('reads every class in the markup, deduped', () => {
    const html = '<div class="p-4 flex"><span class="p-4 font-mono"></span></div>';
    expect(extractCandidates(html)).toEqual(['flex', 'font-mono', 'p-4']);
  });

  it('handles single-quoted attributes', () => {
    expect(extractCandidates("<div class='p-4'></div>")).toEqual(['p-4']);
  });

  /**
   * The case that motivates reading rendered markup rather than source text: an
   * arbitrary value is a single candidate containing brackets and a decimal, and
   * `_` stands in for the space it cannot contain. Splitting on whitespace is
   * therefore exact rather than approximate.
   */
  it('keeps arbitrary values whole', () => {
    const html = '<div class="text-[0.75rem] grid-cols-[1fr_auto]"></div>';
    expect(extractCandidates(html)).toEqual(['grid-cols-[1fr_auto]', 'text-[0.75rem]']);
  });

  it('ignores attributes that merely end in class', () => {
    expect(extractCandidates('<div data-class="p-4"></div>')).toEqual([]);
  });

  it('returns nothing for markup with no classes', () => {
    expect(extractCandidates('<p>plain</p>')).toEqual([]);
  });
});
