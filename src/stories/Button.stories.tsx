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
        'Which accent role fills the button. `inverse` is the maximum-contrast option and paints the text colour as the ground, so it inverts at the light end of the ladder. The hue names (`cyan`, `pink`, `yellow`, `white`, `default`) are deprecated aliases of exactly these roles and still resolve identically.',
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'inverse'],
      table: { defaultValue: { summary: 'tertiary' } },
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
 * The plain button. `primary` is the top of the emphasis ladder, not a neutral
 * default — a page should carry one of these, and the button that is *not* the
 * main action wants `secondary` or `tertiary`.
 */
export const Default: Story = {
  args: {
    children: 'EXECUTE ACTION',
    bracketed: false,
    variant: 'primary',
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
    variant: 'primary',
  },
};

/**
 * Every role, in descending emphasis, with `inverse` last. Switch the toolbar
 * to `white` and watch the bottom one flip to dark-on-paper while the others
 * hold their place in the ladder — that is the whole reason these are named for
 * roles rather than for the colours they happen to be on `midnight`.
 */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Button variant="primary">PRIMARY</Button>
      <Button variant="secondary">SECONDARY</Button>
      <Button variant="tertiary">TERTIARY</Button>
      <Button variant="inverse">INVERSE</Button>
    </div>
  ),
};

/**
 * The deprecated hue names, each above the role it aliases. The two rows are
 * the same four buttons: the aliases share their class strings with the roles
 * rather than repeating them, so they cannot drift, and a unit test asserts it.
 *
 * They are kept only so existing call sites compile. New code should use the
 * top row.
 */
export const DeprecatedHueAliases: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '0.75rem', width: 'max-content' }}>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Button variant="cyan">CYAN</Button>
        <Button variant="yellow">YELLOW</Button>
        <Button variant="pink">PINK</Button>
        <Button variant="white">WHITE</Button>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Button variant="primary">PRIMARY</Button>
        <Button variant="secondary">SECONDARY</Button>
        <Button variant="tertiary">TERTIARY</Button>
        <Button variant="inverse">INVERSE</Button>
      </div>
    </div>
  ),
};
