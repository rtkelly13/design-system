import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Event, GraphTimeline } from './GraphTimeline';

describe('GraphTimeline', () => {
  it('maps Markdown emphasis to current and upcoming states', () => {
    render(<GraphTimeline title="RELEASE"><ul><li>09:00: done</li><li>10:00: <strong>now</strong></li><li>11:00: <em>next</em></li></ul></GraphTimeline>);
    expect(screen.getByLabelText('10:00: now')).toBeTruthy();
    expect(screen.getByLabelText('11:00: next')).toBeTruthy();
  });

  it('accepts explicit Event items', () => {
    render(<GraphTimeline title="EVENTS"><Event date="Mar 18" state="done">deployed</Event></GraphTimeline>);
    expect(screen.getByText('deployed')).toBeTruthy();
    expect(screen.getByText(/1 timeline event/)).toBeTruthy();
  });
});

