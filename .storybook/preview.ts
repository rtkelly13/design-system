import React from 'react';
import type { Preview } from '@storybook/react';
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
      default: 'dark',
      values: [
        { name: 'dark', value: '#000000' },
        { name: 'dim', value: '#121316' },
        { name: 'sketch', value: '#fcfbf9' },
      ],
    },
  },
};

export default preview;
