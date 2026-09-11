import React from 'react';
import type { Preview } from '@storybook/react';
import { ThemeProvider, THEME_ATTRIBUTE } from '../src/components/ThemeProvider';
import { DEFAULT_LEVEL, LEVELS, THEME_LEVELS, isThemeLevel } from '../src/theme/levels';
import '../src/styles.css';

/**
 * The toolbar is built from `THEME_LEVELS`, so a new rung of the ladder appears
 * here without this file being edited. The old setup pinned `defaultTheme` to
 * one level and offered a `backgrounds` picker instead — which painted a colour
 * *behind* an unchanged component, so it looked like a theme switch while
 * changing nothing about the component under it.
 */
const preview: Preview = {
  globalTypes: {
    level: {
      description: 'Theme level',
      toolbar: {
        title: 'Level',
        icon: 'contrast',
        dynamicTitle: true,
        items: THEME_LEVELS.map((level) => ({
          value: level,
          title: LEVELS[level].label,
          right: LEVELS[level].polarity,
        })),
      },
    },
  },

  initialGlobals: {
    level: DEFAULT_LEVEL,
  },

  decorators: [
    (Story, context) => {
      const selected = context.globals.level;
      const level = isThemeLevel(selected) ? selected : DEFAULT_LEVEL;

      // The preview iframe's own <html> carries the attribute so that the page
      // chrome — body background, scrollbars via color-scheme — follows the
      // level too, not just the story subtree.
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute(THEME_ATTRIBUTE, level);
        document.documentElement.classList.remove(...THEME_LEVELS);
        document.documentElement.classList.add(level);
      }

      return React.createElement(
        ThemeProvider,
        // `persist` off: a preview surface should not write the host page's
        // stored preference. The toolbar global is the source of truth here.
        { defaultLevel: level, persist: false, followSystem: false },
        React.createElement(Story),
      );
    },
  ],

  parameters: {
    /**
     * The sidebar order is an argument, not a filing choice.
     *
     * The landing page is whichever entry sorts first, so the manifesto is
     * pinned rather than left to the alphabet. Before this, Storybook opened on
     * `SaaS/AdminDashboardLayout` — first by title, and the least
     * system-shaped thing in the sidebar.
     *
     * The rest reads outward from the system to its applications: the token
     * surfaces a consumer adopts, then the docs chrome built on them, then the
     * product mockups that only demonstrate. Left to the alphabet, `Blog/`
     * landed first — so a consumer's first impression of a token system was a
     * lorem-ipsum blog post, and two mockups at ~20-25% readiness sat at the
     * same visual weight as `Docs/*` at ~90% (`docs/surface-readiness.md`).
     *
     * `check:story-conventions` holds the same vocabulary closed, so a group
     * cannot arrive here without a decision about what this system claims to be.
     */
    options: {
      storySort: {
        order: ['Manifesto', 'Foundations', 'Docs', 'Blog', 'Presentation', 'SaaS', 'Showcase', '*'],
      },
    },

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
