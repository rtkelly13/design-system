import { describe, expect, it } from 'vitest';
import { auditContrast } from '../theme/contrast';
import { LEVELS, THEME_LEVELS } from '../theme/levels';
import { floatingSurface } from './floatingSurface';

/**
 * `check:contrast` covering the overlay surfaces against each ground (#166).
 *
 * A floating element is the one surface in the package that does not choose
 * its ground: a tooltip opened from a card sits over `surface.raised`, one
 * opened from a sunken well over `surface.sunken`, one on the page over
 * `surface.base`. There is no scrim to separate it, so its edge is what does —
 * and that edge is `border.strong`, which is only safe if it clears the
 * non-text floor on all three.
 *
 * Nothing new is audited: every pair below is already one of the pairs
 * `auditContrast` checks. What this adds is the link between the recipe and
 * the audit, so a recipe edit that reached for an unaudited pairing — a
 * `bg-surface-sunken` popup, a `text-content-inverse` item on the raised
 * ground — fails here instead of shipping unmeasured.
 */
const GROUNDS = ['surface.base', 'surface.raised', 'surface.sunken'] as const;

/** The role pairs the recipe paints, keyed by the class that paints each. */
const PAIRS: ReadonlyArray<{ className: string; pairs: readonly string[] }> = [
  // The popup's edge, against every ground it can float over.
  { className: 'border-edge-strong', pairs: GROUNDS.map((g) => `border.strong on ${g}`) },
  // Ink on the popup's own fill.
  { className: 'text-content-primary', pairs: ['text.primary on surface.raised'] },
];

function allClasses(): string {
  const s = floatingSurface();
  const surfaces = [s.positioner(), s.popup()];
  return surfaces.join(' ');
}

describe('the floating surface', () => {
  const classes = allClasses().split(/\s+/);
  const audit = auditContrast(LEVELS);

  it('is filled with the raised surface, never a hue', () => {
    const popup = floatingSurface().popup();
    expect(popup).toContain('bg-surface-raised');
    expect(popup).toContain('border-edge-strong');
    expect(popup).toContain('text-content-primary');
  });

  it.each(PAIRS)('paints `$className` only where the audit measures it', ({ className, pairs }) => {
    expect(classes).toContain(className);
    for (const level of THEME_LEVELS) {
      for (const pair of pairs) {
        const check = audit.find((c) => c.level === level && c.pair === pair);
        expect(check, `${level}: ${pair} is audited`).toBeDefined();
        expect(check?.passes, `${level}: ${pair} ${check?.ratio.toFixed(2)}`).toBe(true);
      }
    }
  });

  it('sits on the top layer from the scale, never a literal z-index', () => {
    const positioner = floatingSurface().positioner();
    expect(positioner).toContain('z-top');
    expect(positioner).not.toMatch(/\bz-(\d|\[)/);
  });

  it('transitions on the motion tokens, and every transition yields to reduced motion', () => {
    const popup = floatingSurface().popup();
    expect(popup).toContain('duration-quick');
    expect(popup).toContain('ease-brutalist');
    expect(popup).toContain('data-[starting-style]:opacity-0');
    expect(popup).toContain('data-[ending-style]:opacity-0');
    expect(popup).toContain('motion-reduce:transition-none');
  });
});
