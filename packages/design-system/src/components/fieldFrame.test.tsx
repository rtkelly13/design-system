import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FieldFrame, accentStyle } from './fieldFrame';

/**
 * The frame is shared by five controls, so what is asserted here is the part
 * none of them should have to re-test: which of `error` and `helperText` is
 * shown, and where the label goes in each layout.
 */
describe('FieldFrame', () => {
  it('stacks the label above the control', () => {
    const { container } = render(
      <FieldFrame label="Api Key">
        <input aria-label="control" />
      </FieldFrame>,
    );

    const label = container.querySelector('label');
    expect(label?.textContent).toBe('Api Key');
    expect(label?.querySelector('input')).toBeNull();
  });

  it('puts the control inside the label when inline', () => {
    const { container } = render(
      <FieldFrame label="Accept terms" layout="inline">
        <input aria-label="control" />
      </FieldFrame>,
    );

    const label = container.querySelector('label');
    expect(label?.textContent).toBe('Accept terms');
    expect(label?.querySelector('input')).not.toBeNull();
  });

  it('renders the control alone when an inline field has no label', () => {
    const { container } = render(
      <FieldFrame layout="inline">
        <input aria-label="control" />
      </FieldFrame>,
    );

    expect(container.querySelector('label')).toBeNull();
    expect(screen.getByLabelText('control')).toBeDefined();
  });

  it('shows helper text when there is no error', () => {
    render(
      <FieldFrame label="Api Key" helperText="32 characters">
        <input aria-label="control" />
      </FieldFrame>,
    );

    expect(screen.getByText('> 32 characters')).toBeDefined();
  });

  it('replaces helper text with the error, announced', () => {
    render(
      <FieldFrame label="Api Key" helperText="32 characters" error="Too short">
        <input aria-label="control" />
      </FieldFrame>,
    );

    expect(screen.getByRole('alert').textContent).toBe('> Too short');
    expect(screen.queryByText('> 32 characters')).toBeNull();
  });

  it('marks the field disabled so the label greys with the control', () => {
    const { container } = render(
      <FieldFrame label="Api Key" disabled layout="inline">
        <input aria-label="control" />
      </FieldFrame>,
    );

    expect(container.querySelector('label')?.hasAttribute('data-disabled')).toBe(true);
  });

  it('forwards a ref and spreads unrecognised props onto the wrapper', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <FieldFrame label="Api Key" ref={ref} data-testid="frame">
        <input aria-label="control" />
      </FieldFrame>,
    );

    expect(ref.current).toBe(screen.getByTestId('frame'));
  });

  it('carries the accent as a custom property rather than a class', () => {
    expect(accentStyle('warning')).toEqual({ '--field-accent': 'var(--ds-intent-warning)' });
  });
});
