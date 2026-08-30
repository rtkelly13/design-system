import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../components/Button';

const meta: Meta<typeof Button> = {
  title: 'Foundations/Button',
  component: Button,
  tags: ['autodocs'],
  /**
   * Written out by hand, and this is the one page in the repo where that is
   * necessary rather than redundant.
   *
   * `ButtonProps` is a discriminated union — `ButtonElementProps |
   * ButtonLinkProps` — and `react-docgen`, which is what Storybook's props
   * table is generated from, extracts **zero** props from it. Not a partial
   * table: an empty one, on the most-used component in the package, with no
   * error anywhere. The JSDoc on `ButtonOwnProps` is real and reaches editor
   * hover and the emitted `.d.ts`; it simply never reaches this page.
   *
   * So the table below is authored, and `pnpm check:story-docs` accepts an
   * `argTypes` description in place of a JSDoc for exactly this case. Keep the
   * two in step — if the union is ever flattened and docgen starts working,
   * delete this block rather than letting it drift.
   */
  argTypes: {
    children: {
      description:
        'The label. Uppercased by the base style, so write it in normal case; an icon node beside the text lays out correctly without extra wrapping.',
      table: { type: { summary: 'ReactNode' } },
    },
    variant: {
      description:
        'Named for the colour it is on `midnight`, not for a colour it guarantees — all five resolve through the accent roles and remap with the level. `default` is an alias of `cyan`; `white` is the inverted maximum-contrast button and inverts to dark-on-paper at the light end.',
      control: 'select',
      options: ['default', 'cyan', 'pink', 'yellow', 'white'],
      table: { defaultValue: { summary: 'pink' } },
    },
    size: {
      description:
        'Padding and type scale: `sm` for a toolbar or table row, `md` for the body of a page, `lg` for a landing-page CTA. The border and offset shadow do not scale with it.',
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      table: { defaultValue: { summary: 'md' } },
    },
    bracketed: {
      description:
        'Wrap the label in `[ BRACKETS ]`. Off by default — a page carries many buttons and few titles, so reserve it for the primary action.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    href: {
      description:
        'Destination. Its presence selects the anchor form — there is no `as` prop — after which TypeScript offers `target`, `rel` and `download` and withdraws `disabled` and `type`. A `target="_blank"` link gets `rel="noopener noreferrer"` unless the caller sets its own.',
      table: { type: { summary: 'string' } },
    },
    className: {
      description:
        "Extra classes. Merged rather than appended, so a caller's `bg-*` genuinely replaces the variant's instead of racing it in CSS source order.",
      table: { type: { summary: 'string' } },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/**
 * The plain button. `variant="default"` is an alias of `cyan` and resolves
 * through `--ds-accent-primary`, so it is not a neutral button — it is the
 * primary one.
 */
export const Default: Story = {
  args: {
    children: 'EXECUTE ACTION',
    bracketed: false,
    variant: 'default',
  },
};

/**
 * `bracketed` wraps the label in the house `[ ]` glyphs, which are
 * `aria-hidden` so the control still announces just its label. Off by default
 * and worth keeping for the primary action: bracketing every button on a page
 * spends the device on nothing.
 */
export const Bracketed: Story = {
  args: {
    children: 'SUBMIT FORM',
    bracketed: true,
    variant: 'default',
  },
};

/**
 * The variant names are honest about one thing and misleading about another.
 * They resolve through the accent roles, so `pink` is `--ds-accent-tertiary`
 * and remaps on every rung — but they are named for the colour they happen to
 * be on `midnight`. Renaming them to their roles is a breaking change and is
 * deliberately not bundled with the token migration, so read `pink` as
 * "tertiary" and pick by role rather than by hue.
 */
export const PinkAccent: Story = {
  args: {
    children: 'DELETE RECORD',
    bracketed: true,
    variant: 'pink',
  },
};
