import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '../components/ThemeProvider';

import {
  describeRenamedLevel,
  isThemeLevel,
  RENAMED_LEVELS,
  reportRenamedLevel,
  THEME_LEVELS,
} from './levels';

/**
 * The 0.2.0 rename, and the decision not to alias around it.
 *
 * A `data-theme` selector that matches nothing fails silently — the page just
 * renders at the default. That is the failure this reporting exists to convert
 * into something a developer can see, so it is worth a test: the alternative to
 * these assertions is finding out from a consumer.
 */

afterEach(() => {
  vi.restoreAllMocks();
  document.documentElement.removeAttribute('data-theme');
});

describe('RENAMED_LEVELS', () => {
  it('maps the two names that changed', () => {
    expect(RENAMED_LEVELS).toEqual({ dark: 'midnight', sketch: 'bright' });
  });

  it('omits `dim`, the one rung whose name survived', () => {
    expect(RENAMED_LEVELS.dim).toBeUndefined();
    expect(isThemeLevel('dim')).toBe(true);
  });

  it('points only at levels that exist', () => {
    for (const replacement of Object.values(RENAMED_LEVELS)) {
      expect(THEME_LEVELS).toContain(replacement);
    }
  });

  /** The point of the decision: the old names must not resolve. */
  it.each(Object.keys(RENAMED_LEVELS))('rejects the old name %s', (old) => {
    expect(isThemeLevel(old)).toBe(false);
  });
});

describe('describeRenamedLevel', () => {
  it('names the replacement', () => {
    expect(describeRenamedLevel('sketch')).toContain('bright');
    expect(describeRenamedLevel('dark')).toContain('midnight');
  });

  it('is silent for a current level, an unknown string, and a non-string', () => {
    expect(describeRenamedLevel('midnight')).toBeUndefined();
    expect(describeRenamedLevel('chartreuse')).toBeUndefined();
    expect(describeRenamedLevel(null)).toBeUndefined();
    expect(describeRenamedLevel(42)).toBeUndefined();
  });
});

describe('reportRenamedLevel', () => {
  it('reports a renamed level once per source, not once per call', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    reportRenamedLevel('dark', 'test-source-a');
    reportRenamedLevel('dark', 'test-source-a');
    reportRenamedLevel('dark', 'test-source-a');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(String(spy.mock.calls[0]?.[0])).toContain('midnight');
  });

  it('says nothing for a level that is still current', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    for (const level of THEME_LEVELS) reportRenamedLevel(level, 'test-source-b');

    expect(spy).not.toHaveBeenCalled();
  });

  /**
   * It is not gated behind `NODE_ENV`, so the blast radius has to be exactly
   * the two renamed names — never arbitrary junk, or it becomes noise a
   * consumer learns to filter out.
   */
  it('says nothing for a value that was never a level', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    reportRenamedLevel('not-a-level', 'test-source-c');
    reportRenamedLevel(undefined, 'test-source-c');
    reportRenamedLevel({}, 'test-source-c');

    expect(spy).not.toHaveBeenCalled();
  });
});

/**
 * The end of the wire. Everything above tests the reporting in isolation; this
 * is the path a consumer actually takes — a theme switcher written against the
 * pre-0.2.0 names sets the attribute, `theme.css` has no selector for it, and
 * the page renders at the default with nothing to explain why.
 */
describe('ThemeProvider meeting a pre-0.2.0 attribute', () => {
  it('reports it instead of silently rendering the default', () => {
    document.documentElement.setAttribute('data-theme', 'sketch');
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(
      <ThemeProvider>
        <div />
      </ThemeProvider>
    );

    const reported = spy.mock.calls.map((call) => String(call[0])).join('\n');
    expect(reported).toContain('sketch');
    expect(reported).toContain('bright');
  });
});
