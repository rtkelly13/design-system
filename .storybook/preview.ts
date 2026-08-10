import React from 'react';
import type { Preview } from '@storybook/react-vite';
import { ThemeProvider } from '../src/components/ThemeProvider';
import '../src/styles.css';

const preview: Preview = {
  decorators: [
    (Story) =>
      React.createElement(
        ThemeProvider,
        { defaultTheme: 'dark' },
        React.createElement(Story)
      ),
  ],

  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        dark: { name: 'dark', value: '#000000' },
        dim: { name: 'dim', value: '#121316' },
        sketch: { name: 'sketch', value: '#fcfbf9' }
      }
    },
  },

  initialGlobals: {
    backgrounds: {
      value: 'dark'
    }
  }
};

export default preview;
