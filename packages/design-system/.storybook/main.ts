import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';

/**
 * Composed Storybooks, keyed by the ref id that appears in the sidebar.
 *
 * The blog consumes this package rather than defining tokens of its own, so its
 * Storybook documents a different tier: app-level compositions (Foundations /
 * Atoms / Molecules) built on what ships from here. Composing it means one URL
 * answers both "what does the system provide" and "what does the site do with it".
 *
 * Driven by env, not hardcoded, for two reasons: the URL differs per Vercel
 * environment (production vs the `preview` branch domain), and an unreachable
 * ref renders as a permanently-erroring sidebar entry. Unset — the default for
 * `pnpm storybook` locally — composes nothing and the sidebar is just this repo.
 *
 * The composed Storybook must send `Access-Control-Allow-Origin` on its
 * `index.json`: the manager fetches it cross-origin from the browser.
 */
const REFS: Record<string, { title: string; url: string; expanded: boolean }> = {};

const blogStorybookUrl = process.env.STORYBOOK_REF_BLOG_URL?.trim();
if (blogStorybookUrl) {
  REFS.blog = {
    // Not "Blog" — this repo already has a top-level `Blog/` group of its own
    // (BlogPost, LoremIpsumPost), and two sidebar sections by that name read as
    // a duplicate rather than as two tiers.
    title: 'ryankelly.dev (site)',
    url: blogStorybookUrl.replace(/\/$/, ''),
    // Collapsed by default so this repo's own stories stay the landing view.
    expanded: false,
  };
}

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  refs: REFS,
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(config) {
    const { mergeConfig } = await import('vite');
    return mergeConfig(config, {
      plugins: [tailwindcss()],
    });
  },
  docs: {},
};

export default config;
