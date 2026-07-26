import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from '../components/Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Foundations/Avatar',
  component: Avatar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: {
    fallback: 'RK',
    accent: 'cyan',
    size: 'md',
  },
};

export const PinkAccent: Story = {
  args: {
    fallback: 'AI',
    accent: 'pink',
    size: 'lg',
  },
};
