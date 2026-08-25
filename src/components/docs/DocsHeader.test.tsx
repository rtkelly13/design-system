import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DocsHeader } from './DocsHeader';
import { ThemeProvider } from '../ThemeProvider';

/**
 * `DocsHeader` destructured `useTheme()`, which throws without a provider — and
 * a docs header is chrome that a consumer theming with the `data-theme`
 * attribute alone would reasonably render. So the whole page came down rather
 * than one control being dropped.
 *
 * That is the kind of failure a screenshot cannot see: every story in this repo
 * mounts a provider through the Storybook decorator, so the suite was green on
 * a component that could not render in one of its two documented deployment
 * shapes.
 */
describe('DocsHeader without a ThemeProvider', () => {
  it('renders', () => {
    // The brand is bracketed, so its text is split across elements — assert the
    // landmark rather than trying to match the string back together.
    const { container } = render(<DocsHeader title="TVS Docs" />);

    expect(container.querySelector('header')).not.toBeNull();
    expect(container.textContent).toContain('TVS DOCS');
  });

  it('omits the level switcher rather than offering a dead one', () => {
    render(<DocsHeader title="TVS Docs" />);

    expect(screen.queryByLabelText(/Switch theme level/)).toBeNull();
  });

  it('still renders the rest of the chrome', () => {
    render(<DocsHeader title="TVS Docs" onSearch={() => undefined} />);

    expect(screen.getByLabelText('Search documentation')).toBeDefined();
  });
});

describe('DocsHeader with a ThemeProvider', () => {
  it('offers the level switcher', () => {
    render(
      <ThemeProvider>
        <DocsHeader title="TVS Docs" />
      </ThemeProvider>
    );

    expect(screen.getByLabelText(/Switch theme level/)).toBeDefined();
  });
});
