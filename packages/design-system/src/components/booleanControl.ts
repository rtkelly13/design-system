import { recipe } from '../lib/recipe';

/**
 * The surface a boolean control wears, in its two presentations.
 *
 * `Checkbox` and `Switch` are one capability — a boolean — drawn twice, so the
 * border weight, the checked fill, the disabled treatment and the invalid
 * border are declared **once** and selected by `shape`. Two recipes would
 * drift, and the drift would show up as a switch that disagrees with the
 * checkbox beside it about what "disabled" looks like.
 *
 * A module of its own for the reason `dialogSurface.ts` gives: `src/index.ts`
 * re-exports the component files wholesale, and a `recipe` in the published
 * surface puts `tailwind-variants`' types back into the `.d.ts`.
 *
 * Every state here is a Base UI data attribute — `data-checked`,
 * `data-indeterminate`, `data-disabled`, `data-invalid` — so nothing in the
 * components computes a class from a prop. `data-invalid` in particular is
 * inherited from the enclosing `Field.Root`, which is what makes an error on
 * the field visible on the control without either being told about the other.
 *
 * No focus class. The global `:focus-visible` outline in `styles.css` is the
 * ring, and a component-level override is exactly the #44 regression that rule
 * exists to prevent.
 */
export const booleanControl = recipe({
  slots: {
    control:
      'flex shrink-0 border-2 border-edge-strong bg-surface-base transition-colors duration-quick ease-brutalist '
      + 'data-[disabled]:cursor-not-allowed data-[disabled]:border-edge-subtle data-[disabled]:bg-surface-sunken '
      + 'data-[invalid]:border-intent-danger motion-reduce:transition-none',
    mark: 'pointer-events-none',
  },
  variants: {
    shape: {
      /** A square box with a mark in it: the checkbox. */
      box: {
        control:
          'size-6 cursor-pointer items-center justify-center '
          + 'data-[checked]:bg-[var(--field-accent)] data-[indeterminate]:bg-[var(--field-accent)]',
        mark: 'font-mono text-sm font-bold leading-none text-content-inverse',
      },
      /** A track the thumb travels along: the switch. */
      track: {
        control:
          'h-6 w-12 cursor-pointer items-center p-0.5 '
          + 'data-[checked]:bg-[var(--field-accent)]',
        mark:
          'size-4 bg-content-primary transition-transform duration-quick ease-brutalist '
          + 'data-[checked]:translate-x-6 data-[checked]:bg-content-inverse '
          + 'data-[disabled]:bg-content-muted motion-reduce:transition-none',
      },
    },
  },
});
