import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReportDetails, ReportDocument, ReportSection } from './ReportDocument';

describe('ReportDocument', () => {
  it('renders the title as the document heading, and the metadata as a definition list', () => {
    render(
      <ReportDocument
        title="Contrast audit"
        subtitle="Every role pair, both levels"
        meta={[{ label: 'Commit', value: 'abc1234' }]}
      >
        <p>body</p>
      </ReportDocument>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Contrast audit' })).not.toBeNull();
    // A definition list rather than two spans: the label/value relationship is
    // what a screen reader needs to read the strip as pairs.
    expect(screen.getByRole('term').textContent).toBe('Commit');
    expect(screen.getByRole('definition').textContent).toBe('abc1234');
  });

  it('forwards its ref and merges a caller className without dropping its own', () => {
    const ref = createRef<HTMLElement>();
    render(
      <ReportDocument ref={ref} title="T" className="max-w-none">
        <p>body</p>
      </ReportDocument>,
    );

    expect(ref.current?.tagName).toBe('ARTICLE');
    expect(ref.current?.classList.contains('max-w-none')).toBe(true);
    // The recipe's own class survives the merge — a caller adding one must not
    // silently replace the frame's surface.
    expect(ref.current?.classList.contains('bg-surface-base')).toBe(true);
  });
});

describe('ReportSection', () => {
  it('derives an anchor from the title so a reader can link to the section', () => {
    render(
      <ReportSection title="Failing checks">
        <p>body</p>
      </ReportSection>,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Failing checks' })).not.toBeNull();
    expect(document.querySelector('section')?.id).toBe('failing-checks');
  });

  it('prefers an explicit id, because a generated one changes when the title is reworded', () => {
    render(
      <ReportSection title="Failing checks" id="failures">
        <p>body</p>
      </ReportSection>,
    );

    expect(document.querySelector('section')?.id).toBe('failures');
  });
});

describe('ReportDetails', () => {
  it('folds its content away by default and opens when asked', () => {
    const { rerender } = render(
      <ReportDetails summary="Stack trace">
        <pre>frames</pre>
      </ReportDetails>,
    );
    expect(document.querySelector('details')?.open).toBe(false);

    rerender(
      <ReportDetails summary="Stack trace" open>
        <pre>frames</pre>
      </ReportDetails>,
    );
    expect(document.querySelector('details')?.open).toBe(true);
  });

  it('hides the [+]/[-] marker from assistive technology, which already announces the state', () => {
    render(
      <ReportDetails summary="Stack trace" note="12 frames">
        <pre>frames</pre>
      </ReportDetails>,
    );

    const marker = document.querySelector('summary [aria-hidden="true"]');
    expect(marker).not.toBeNull();
    expect(screen.getByText('12 frames')).not.toBeNull();
  });
});
