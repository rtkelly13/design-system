import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BeforeAfter } from './BeforeAfter';

describe('BeforeAfter', () => {
  it('formats Markdown values with units and exposes the comparison', () => {
    render(<BeforeAfter fromLabel="before" toLabel="after"><ul><li>p95: 160 ms → 142 ms</li></ul></BeforeAfter>);
    expect(screen.getByLabelText('p95 from 160 to 142')).toBeTruthy();
    expect(screen.getByText('160')).toBeTruthy();
    expect(screen.getByText('142')).toBeTruthy();
  });

  it('renders explicit numeric items', () => {
    render(<BeforeAfter fromLabel="old" toLabel="new" items={[{ label: 'requests', from: 10, to: 20 }]} />);
    expect(screen.getByLabelText('requests from 10 to 20')).toBeTruthy();
  });
});
