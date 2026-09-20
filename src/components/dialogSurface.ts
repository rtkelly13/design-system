import { recipe } from '../lib/recipe';

/**
 * The chrome both dialogs wear.
 *
 * A module of its own, not a shared export from `Modal.tsx`: `src/index.ts`
 * re-exports that file wholesale, and a `recipe` in the published surface puts
 * `tailwind-variants`' types back into the `.d.ts` — which `lib/recipe.ts`
 * exists to prevent, since it would make swapping the engine a breaking
 * change. Nothing exports this one, so the types stay in.
 *
 * `Modal` and `AlertDialog` are the same surface with different dismissal
 * contracts, so the surface is declared once. Two recipes would drift, and the
 * drift would show up as a confirmation dialog that does not look like the
 * dialog it was opened from.
 *
 * `overlay` and `popup` both sit on `z-top`: the viewport follows the backdrop
 * in DOM order, so it paints above it without a second stacking value. The
 * layer comes from the `--ds-layer-*` scale either way — the `z-50` this
 * component used to hardcode is the drift the token layer exists to prevent.
 */
export const dialogSurface = recipe({
  slots: {
    /*
     * Enter and exit are `data-starting-style` / `data-ending-style` rather
     * than keyframes: Base UI sets them for one frame either side of the
     * transition, so an opacity pair and a duration is the whole animation.
     * `motion-reduce` drops it — an overlay appearing is exactly the motion
     * `prefers-reduced-motion` is asking not to see.
     */
    backdrop:
      'fixed inset-0 z-top bg-surface-overlay transition-opacity duration-quick ease-brutalist '
      + 'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 motion-reduce:transition-none',
    viewport: 'fixed inset-0 z-top flex items-center justify-center p-4',
    popup:
      'max-h-[90vh] w-full max-w-lg overflow-y-auto border-4 border-edge-strong bg-surface-raised '
      + 'font-mono shadow-hard-lg transition-opacity duration-quick ease-brutalist '
      + 'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 motion-reduce:transition-none',
    header:
      'flex items-center justify-between border-b-2 border-edge-strong bg-surface-base px-6 py-4',
    title:
      'font-display text-xl font-bold uppercase tracking-wider text-content-primary',
    close:
      'border-2 border-edge-strong bg-surface-raised px-2 font-mono text-lg font-bold '
      + 'text-content-primary transition-colors hover:bg-surface-base hover:text-accent-tertiary '
      + 'focus-visible:ring-2 focus-visible:ring-accent-primary',
    body: 'p-6 font-sans text-sm leading-relaxed text-content-primary',
    footer:
      'flex justify-end gap-3 border-t-2 border-edge-strong bg-surface-base px-6 py-4',
  },
});
