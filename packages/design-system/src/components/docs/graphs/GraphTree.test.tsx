import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GraphTree, Node } from './GraphTree';

describe('GraphTree', () => {
  it('renders nested explicit nodes and announces the count', () => {
    render(<GraphTree title="FILES"><Node label="src"><Node label="Graph.tsx" meta="12 KB" accent /></Node></GraphTree>);
    expect(screen.getByText('Graph.tsx')).toBeTruthy();
    expect(screen.getByText('12 KB')).toBeTruthy();
    expect(screen.getByText('Tree with 2 nodes.')).toBeTruthy();
  });

  it('renders an empty tree', () => {
    render(<GraphTree title="EMPTY" />);
    expect(screen.getByText('Tree with 0 nodes.')).toBeTruthy();
  });
});

