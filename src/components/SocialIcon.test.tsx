import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GitHubIcon, SocialIcon } from './SocialIcon';

describe('SocialIcon', () => {
  it('renders each supported brand as a labelled SVG image', () => {
    for (const name of ['github', 'linkedin', 'bluesky', 'x', 'mail'] as const) {
      const { unmount } = render(<SocialIcon name={name} />);
      const expectedLabels = { github: 'GitHub', linkedin: 'LinkedIn', bluesky: 'Bluesky', x: 'X', mail: 'Email' } as const;
      const icon = screen.getByRole('img', { name: expectedLabels[name] });
      expect(icon.tagName).toBe('svg');
      expect(icon.querySelector('path')).not.toBeNull();
      unmount();
    }
  });

  it('renders a labelled external link and adds safe blank-target rel', () => {
    render(<GitHubIcon href="https://github.com/rtkelly13" target="_blank" />);

    const link = screen.getByRole('link', { name: 'GitHub' });
    expect(link.getAttribute('href')).toBe('https://github.com/rtkelly13');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('allows an explicit label, accent class, and relationship', () => {
    render(<SocialIcon name="mail" label="Contact Ryan" href="mailto:ryan@example.com" rel="me" />);

    expect(screen.getByRole('link', { name: 'Contact Ryan' }).getAttribute('rel')).toBe('me');
    expect(screen.getByRole('link').querySelector('svg')?.className.baseVal).toContain('text-accent-primary');
  });

  it('points an object ref at the anchor, not the nested mark, when linked', () => {
    const objectRef = { current: null };
    render(<SocialIcon name="github" href="https://github.com/rtkelly13" ref={objectRef} />);
    expect(objectRef.current).toBe(screen.getByRole('link'));
  });

  it('fires a callback ref once, for the rendered root only', () => {
    const callbackRef = vi.fn();
    render(<SocialIcon name="x" href="https://x.com/rtkelly13" ref={callbackRef} />);
    expect(callbackRef).toHaveBeenCalledTimes(1);
    expect(callbackRef).toHaveBeenCalledWith(screen.getByRole('link'));
  });
});
