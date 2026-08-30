import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './Button';
import type { ButtonEmphasis, LegacyButtonVariant } from './Button';

/**
 * `variant` gained role names in #90 and kept the hue names as aliases.
 *
 * The claim that makes it non-breaking is narrow and testable: an alias must
 * produce the *same class string* as the role it aliases. Asserting the
 * strings match each other rather than matching a literal is deliberate — the
 * classes are free to change, the equivalence is not.
 */
const ALIASES: Record<LegacyButtonVariant, ButtonEmphasis> = {
  cyan: 'primary',
  default: 'primary',
  yellow: 'secondary',
  pink: 'tertiary',
  white: 'inverse',
};

function classesFor(variant: string) {
  const { container } = render(<Button variant={variant as ButtonEmphasis}>GO</Button>);
  return container.querySelector('button')?.className;
}

describe('Button variant', () => {
  it.each(Object.entries(ALIASES))(
    'renders the deprecated alias %s identically to %s',
    (legacy, role) => {
      expect(classesFor(legacy)).toBe(classesFor(role));
    },
  );

  it('defaults to tertiary, which is what `pink` used to resolve to', () => {
    const { container } = render(<Button>GO</Button>);
    expect(container.querySelector('button')?.className).toBe(classesFor('tertiary'));
  });

  it('gives each role a distinct treatment', () => {
    const roles: ButtonEmphasis[] = ['primary', 'secondary', 'tertiary', 'inverse'];
    const rendered = roles.map(classesFor);
    expect(new Set(rendered).size).toBe(roles.length);
  });

  it('keeps the link form on the same variant classes as the button form', () => {
    const { container } = render(
      <Button href="/pricing" variant="primary">
        GO
      </Button>,
    );
    const anchor = container.querySelector('a');
    // The anchor adds `asLink` layout utilities on top; the fill must match.
    expect(anchor?.className).toContain('bg-accent-primary');
    expect(anchor?.className).toContain('inline-flex');
  });
});
