import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar } from './Avatar';
import { accentVar } from '../lib/theme';
import type { LegacyAccent } from '../lib/theme';

/**
 * `accent` was widened from the four legacy hue names to the full `AccentToken`
 * set in #91, which replaced a hand-written `switch` with `accentVar()`.
 *
 * The whole claim of that change is that it is a no-op for anything that
 * already compiled, so the test that matters is the one asserting the four old
 * names still land on the variables the switch produced. Those are written out
 * as literals on purpose: reading them from `accentVar` would make the
 * assertion agree with itself.
 */
const LEGACY_EXPECTATIONS: Record<LegacyAccent, string> = {
  cyan: 'var(--ds-accent-primary)',
  yellow: 'var(--ds-accent-secondary)',
  pink: 'var(--ds-accent-tertiary)',
  green: 'var(--ds-intent-success)',
};

/** The offset shadow is where the accent shows even when an image fills the frame. */
function shadowOf(element: HTMLElement) {
  return element.style.boxShadow;
}

describe('Avatar accent', () => {
  it.each(Object.entries(LEGACY_EXPECTATIONS))(
    'resolves the legacy name %s to the variable the old switch produced',
    (accent, expected) => {
      const { container } = render(
        <Avatar fallback="RK" accent={accent as LegacyAccent} data-testid="avatar" />,
      );
      const avatar = container.firstElementChild as HTMLElement;
      expect(shadowOf(avatar)).toContain(expected);
    },
  );

  it('accepts an intent role, which the four-hue union could not express', () => {
    const { container } = render(<Avatar fallback="RK" accent="danger" />);
    const avatar = container.firstElementChild as HTMLElement;
    expect(shadowOf(avatar)).toContain(accentVar('danger'));
  });

  it('falls back to the primary accent when none is given', () => {
    const { container } = render(<Avatar fallback="RK" />);
    const avatar = container.firstElementChild as HTMLElement;
    expect(shadowOf(avatar)).toContain('var(--ds-accent-primary)');
  });

  it('colours the fallback initials with the same variable as the shadow', () => {
    render(<Avatar fallback="RK" accent="success" />);
    expect((screen.getByText('RK') as HTMLElement).style.color).toBe(accentVar('success'));
  });
});
