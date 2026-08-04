import path from 'node:path';

/** Shared between the walkthrough spec and the contact-sheet builder. */

export interface StoryEntry {
  id: string;
  /** Storybook group, e.g. `Foundations/Card`. */
  title: string;
  /** Story name within the group, e.g. `Default`. */
  name: string;
}

export const REPO_ROOT = path.resolve(__dirname, '..');

export const STORYBOOK_DIR = path.join(REPO_ROOT, 'storybook-static');
export const STORYBOOK_INDEX = path.join(STORYBOOK_DIR, 'index.json');

export const WALKTHROUGH_DIR = path.join(REPO_ROOT, 'walkthrough');
export const SHOTS_DIR = path.join(WALKTHROUGH_DIR, 'shots');

/**
 * Every theme the system ships. Capturing all three is the point of the
 * artifact: a token change that reads fine in `dark` can be unusable in
 * `sketch`, and that is exactly the class of regression a pixel diff against a
 * single-theme baseline will not surface.
 */
export const THEMES = ['dark', 'dim', 'sketch'] as const;

export type Theme = (typeof THEMES)[number];

/** Story ids are already filename-safe (Storybook slugifies them). */
export function shotPath(theme: string, storyId: string): string {
  return path.join(SHOTS_DIR, theme, `${storyId}.png`);
}

/** Path relative to `walkthrough/`, for use in the generated HTML. */
export function shotHref(theme: string, storyId: string): string {
  return `shots/${theme}/${storyId}.png`;
}
