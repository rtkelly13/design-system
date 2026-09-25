import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GraphFlow } from './GraphFlow';

describe('GraphFlow', () => {
  it('renders Markdown paths and an accessible summary', () => {
    render(<GraphFlow title="PUBLISH"><ul><li>write → <strong>ship</strong></li></ul></GraphFlow>);
    expect(screen.getByText('write')).toBeTruthy();
    expect(screen.getByText('ship')).toBeTruthy();
    expect(screen.getByText(/Flow with 1 path/)).toBeTruthy();
  });

  it('renders an empty state without throwing', () => {
    render(<GraphFlow title="EMPTY" />);
    expect(screen.getByText('Empty flow.')).toBeTruthy();
  });
});

