import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GraphDiff } from './GraphDiff';

describe('GraphDiff', () => {
  it('renders additions, removals, and totals from Markdown', () => {
    render(<GraphDiff title="SIZE"><ul><li>bundle: +2 kb</li><li>unused: -1 kb</li><li><strong>total: 1 kb</strong></li></ul></GraphDiff>);
    expect(screen.getByLabelText('add: bundle 2 kb')).toBeTruthy();
    expect(screen.getByLabelText('remove: unused 1 kb')).toBeTruthy();
    expect(screen.getByLabelText('total: total 1 kb')).toBeTruthy();
  });

  it('renders an empty diff', () => {
    render(<GraphDiff title="EMPTY" />);
    expect(screen.getByText('Empty diff.')).toBeTruthy();
  });
});

