import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Prose } from '../components/docs/Prose';

const meta: Meta<typeof Prose> = {
  title: 'Docs/Prose',
  component: Prose,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Prose>;

/**
 * Styles raw HTML by element, which is what MDX output is — so the story uses
 * bare tags deliberately rather than the component equivalents.
 */
export const Default: Story = {
  render: () => (
    <Prose>
      <h2>Composition</h2>
      <p>
        The host reads the composed Storybook&rsquo;s index in the browser, which is why the
        composed origin has to send CORS headers.
      </p>
      <ul>
        <li>Production aliases and custom domains serve publicly</li>
        <li>Per-deployment URLs redirect to SSO</li>
      </ul>
      <blockquote>A ref that cannot be reached renders as a permanently erroring entry.</blockquote>
      <p>
        Inline <code>index.json</code> and a <a href="#link">link</a> for contrast.
      </p>
    </Prose>
  ),
};

/**
 * `not-prose` is the escape hatch, and it is not optional for chrome nested
 * inside an article. Every selector the typography plugin generates excludes a
 * `not-prose` subtree, which is what stops a breadcrumb inheriting list markers
 * and the prose link treatment. The right-hand box below is the same markup
 * without it.
 */
export const NotProseEscapeHatch: Story = {
  render: () => (
    <Prose>
      <h2>Chrome inside an article</h2>
      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr' }}>
        <nav className="not-prose">
          <ul>
            <li><a href="#a">Docs</a></li>
            <li><a href="#b">Foundations</a></li>
          </ul>
        </nav>
        <nav>
          <ul>
            <li><a href="#a">Docs</a></li>
            <li><a href="#b">Foundations</a></li>
          </ul>
        </nav>
      </div>
      <p>Left carries <code>not-prose</code>; right does not.</p>
    </Prose>
  ),
};

/**
 * `brutalist={false}` drops the house deltas — the uppercase display headings,
 * the rules under h1 and h2, the hard-edged code chips — and leaves the
 * typography plugin's own defaults mapped onto the role tokens. It exists to
 * make the difference between "the plugin" and "this system" visible, not as a
 * mode to ship: an article rendered this way still rethemes correctly but stops
 * looking like the rest of the site.
 */
export const PluginDefaults: Story = {
  render: () => (
    <Prose brutalist={false}>
      <h2>Composition</h2>
      <p>
        The same markup with the house deltas turned off. Compare the heading treatment and the
        inline <code>code</code> chip against the default story.
      </p>
    </Prose>
  ),
};
