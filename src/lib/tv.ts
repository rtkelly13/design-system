/**
 * The configured variant builder every component uses.
 *
 * ## Why a variant library at all
 *
 * Components used to compose classes by appending the consumer's `className` to
 * the end of a template string. That does nothing. Tailwind decides which of two
 * conflicting utilities wins by **CSS source order**, not by the order they
 * appear in the class attribute — so a consumer passing `bg-surface-raised` to a
 * component whose base is `bg-surface-base` got whichever the stylesheet
 * happened to emit later. Every `className` prop in this package was unreliable
 * in exactly that way.
 *
 * `tv` resolves conflicts before the class string reaches the DOM, so the last
 * value genuinely wins. That is a correctness fix, not an ergonomic one.
 *
 * ## Why `tailwind-variants` rather than `cva`
 *
 * Slots. Most components here style more than one element — a field is a label,
 * a control and a message; the docs chrome is a dozen parts — and `cva` models
 * one element per recipe, leaving the rest to be hand-assembled. `tv` also
 * vendors its conflict resolution, so this is one dependency with none of its
 * own rather than three.
 */

import { createTV } from 'tailwind-variants';

/**
 * Almost nothing needs declaring here, which is worth knowing before anyone
 * adds to it: `tailwind-merge` classifies our semantic tokens correctly with no
 * configuration at all. `bg-surface-raised` beats `bg-surface-base`,
 * `text-accent-primary` beats `text-content-primary`, and — the case that
 * actually matters — a colour and a size in the same `text-*` position are
 * recognised as different properties, so `text-content-primary text-sm`
 * survives intact.
 *
 * The hard shadows are the exception. `shadow-hard-md` is read as a custom
 * shadow value while `shadow-none` is read as box-shadow, so without this the
 * two would both survive and the CSS would arbitrate — meaning `shadow-none`
 * could not reliably clear a hard shadow. Declaring the scale puts them in one
 * group.
 */
export const twMergeConfig = {
  extend: {
    theme: {
      shadow: ['hard-sm', 'hard-md', 'hard-lg'],
    },
  },
} as const;

/**
 * Use this, not the bare `tv` from the package — the bare one has no knowledge
 * of the hard-shadow scale.
 */
export const tv = createTV({ twMergeConfig });

export { cn, cx } from 'tailwind-variants';
export type { VariantProps } from 'tailwind-variants';
