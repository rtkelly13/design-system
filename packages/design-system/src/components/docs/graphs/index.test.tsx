import { describe, expect, it } from 'vitest';
import { mdxComponents } from '../mdxComponents';
import {
  Event,
  Graph,
  GraphDiff,
  GraphFlow,
  GraphSlope,
  GraphTimeline,
  GraphTree,
  GraphUptime,
  Line,
  Node,
  Path,
  Slope,
  Step,
  Steps,
  Terminal,
} from './index';

describe('mdxcn-derived docs surface', () => {
  it('exports every graph component and MDX data item publicly', () => {
    expect([Graph, GraphFlow, GraphTimeline, GraphDiff, GraphSlope, GraphUptime, GraphTree, Terminal, Steps]).toHaveLength(9);
    expect([Path, Event, Line, Slope, Node, Step]).toHaveLength(6);
  });

  it('registers the authored JSX names in the MDX map', () => {
    expect(mdxComponents).toMatchObject({ Graph, GraphFlow, GraphTimeline, GraphDiff, GraphSlope, GraphUptime, GraphTree, Terminal, Steps, Path, Event, Line, Slope, Node, Step });
  });
});

