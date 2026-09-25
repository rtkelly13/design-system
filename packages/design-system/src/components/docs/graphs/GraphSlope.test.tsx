import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GraphSlope } from './GraphSlope';

describe('GraphSlope', () => {
  it('formats Markdown values with units and exposes the comparison', () => {
    render(<GraphSlope title="LATENCY" fromLabel="before" toLabel="after"><ul><li>p95: 160 ms → 142 ms</li></ul></GraphSlope>);
    expect(screen.getByLabelText('p95 from 160 to 142')).toBeTruthy();
    expect(screen.getByText('160')).toBeTruthy();
    expect(screen.getByText('142')).toBeTruthy();
  });

  it('renders explicit numeric items', () => {
    render(<GraphSlope title="SLOPE" fromLabel="old" toLabel="new" items={[{ label: 'requests', from: 10, to: 20 }]} />);
    expect(screen.getByLabelText('requests from 10 to 20')).toBeTruthy();
  });
});

