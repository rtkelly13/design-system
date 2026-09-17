import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getThemeInitScript,
  THEME_ATTRIBUTE,
  THEME_STORAGE_KEY,
  ThemeProvider,
  useTheme,
} from './ThemeProvider';
import { SYSTEM_LEVEL, THEME_LEVELS } from '../theme/levels';

function Probe() {
  const { level, polarity, cycleLevel, setLevel, levels } = useTheme();

  return (
    <>
      <output data-testid="level">{level}</output>
      <output data-testid="polarity">{polarity}</output>
      <output data-testid="levels">{levels.join(',')}</output>
      <button type="button" onClick={cycleLevel}>
        Next
      </button>
      <button type="button" onClick={() => setLevel('midnight')}>
        Midnight
      </button>
    </>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute(THEME_ATTRIBUTE);
    document.documentElement.className = '';
  });

  it('serialises the current ladder and system mapping into the init script', () => {
    const script = getThemeInitScript({ defaultLevel: 'sketch', followSystem: false });

    expect(script).toContain(JSON.stringify(THEME_LEVELS));
    expect(script).toContain(JSON.stringify(SYSTEM_LEVEL));
    expect(script).toContain(JSON.stringify(THEME_STORAGE_KEY));
    expect(script).toContain(JSON.stringify('sketch'));
  });

  it('provides level state and cycles through the ladder', async () => {
    render(
      <ThemeProvider defaultLevel="midnight" persist={false} followSystem={false}>
        <Probe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('level').textContent).toBe('midnight');
    expect(screen.getByTestId('polarity').textContent).toBe('dark');
    expect(screen.getByTestId('levels').textContent).toBe(THEME_LEVELS.join(','));

    screen.getByRole('button', { name: 'Next' }).click();
    await waitFor(() => expect(screen.getByTestId('level').textContent).toBe('sketch'));
    expect(screen.getByTestId('polarity').textContent).toBe('light');

    screen.getByRole('button', { name: 'Midnight' }).click();
    await waitFor(() => expect(screen.getByTestId('level').textContent).toBe('midnight'));
  });

  it('uses the system mapping when no stored level or document level exists', async () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(() => ({ matches: true }) as MediaQueryList),
    });

    render(
      <ThemeProvider persist={false} followSystem>
        <Probe />
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe(SYSTEM_LEVEL.dark),
    );
    expect(screen.getByTestId('level').textContent).toBe(SYSTEM_LEVEL.dark);
  });

  it('themes a scoped subtree without changing the document or persisting', async () => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, 'midnight');
    render(
      <ThemeProvider
        defaultLevel="sketch"
        persist
        followSystem={false}
        scoped
        className="mt-4"
      >
        <Probe />
      </ThemeProvider>,
    );

    const wrapper = screen.getByTestId('level').parentElement as HTMLElement;
    expect(wrapper.getAttribute(THEME_ATTRIBUTE)).toBe('sketch');
    expect(wrapper.className).toContain('mt-4');
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('midnight');
    await waitFor(() => expect(screen.getByTestId('level').textContent).toBe('sketch'));
  });

  it('works without touching storage when persistence is disabled', async () => {
    render(
      <ThemeProvider defaultLevel="sketch" persist={false} followSystem={false}>
        <Probe />
      </ThemeProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('level').textContent).toBe('sketch'));
  });
});
