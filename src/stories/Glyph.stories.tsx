import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Glyph } from '../components/Glyph';

/**
 * A single mark, sized and coloured by the system — where the mark may be a
 * Nerd Font glyph *or* literal characters you type.
 *
 * That second half is what separates it from `NerdIcon`. `NerdIcon` takes a
 * `name` and renders from the icon font. `Glyph` takes children, so `->`,
 * `[x]`, `::` and `~` are first-class: they inherit the same accent roles, the
 * same size scale and the same optional brackets as a font glyph, and end up
 * on the same baseline beside one.
 *
 * The reason to have both is that this system's voice is monospace and ASCII.
 * An arrow drawn as `->` reads as part of the sentence; the same arrow as an
 * icon reads as chrome attached to it. `Glyph` lets that be a choice per mark
 * rather than a decision made once by whichever component was available.
 */
const meta: Meta<typeof Glyph> = {
  title: 'Foundations/Glyph',
  component: Glyph,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Glyph>;

/**
 * Literal ASCII as content. Each of these is typed, not looked up — which means
 * a mark the icon font has never heard of still gets the system's treatment.
 */
export const AsciiMarks: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4 p-8 font-mono">
      <Glyph>-&gt;</Glyph>
      <Glyph>&lt;-</Glyph>
      <Glyph>::</Glyph>
      <Glyph>~</Glyph>
      <Glyph>[+]</Glyph>
      <Glyph>[x]</Glyph>
    </div>
  ),
};

/**
 * The accent roles, which are semantic rather than hues — `success` is whatever
 * the current theme means by success, so these remap with the theme instead of
 * being frozen green.
 */
export const AccentRoles: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4 p-8 font-mono">
      <Glyph accent="primary">[&gt;]</Glyph>
      <Glyph accent="secondary">[~]</Glyph>
      <Glyph accent="tertiary">[::]</Glyph>
      <Glyph accent="success">[+]</Glyph>
      <Glyph accent="danger">[x]</Glyph>
    </div>
  ),
};

/**
 * `bracketed` wraps the mark in the same `[ ]` used throughout the system, so a
 * glyph sits inside the typography rather than beside it. Shown across the size
 * scale, because the brackets have to track the mark's size to stay convincing.
 */
export const BracketedSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4 p-8 font-mono">
      <Glyph bracketed size="xs">
        -&gt;
      </Glyph>
      <Glyph bracketed size="sm">
        -&gt;
      </Glyph>
      <Glyph bracketed size="md">
        -&gt;
      </Glyph>
      <Glyph bracketed size="lg">
        -&gt;
      </Glyph>
      <Glyph bracketed size="xl">
        -&gt;
      </Glyph>
    </div>
  ),
};

/**
 * A decorative mark is hidden from assistive technology; a meaningful one needs
 * a `label`.
 *
 * The distinction matters more here than for an icon font, because ASCII marks
 * are read aloud character by character. An unlabelled `[x]` announces as
 * "bracket x bracket", which is worse than silence — hence `label` when the
 * mark carries meaning, and nothing when it is ornament.
 */
export const Labelled: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4 p-8 font-mono">
      <Glyph accent="danger" label="Failed">
        [x]
      </Glyph>
      <Glyph accent="success" label="Passed">
        [+]
      </Glyph>
      <Glyph>~</Glyph>
    </div>
  ),
};
