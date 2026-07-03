import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button.js';

const meta = {
  title: 'UI/Button',
  component: Button,
  args: {
    children: 'Continue',
    surface: 'customer',
    intent: 'primary',
    size: 'md',
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CustomerPrimary: Story = {};

export const AdminSecondary: Story = {
  args: {
    surface: 'admin',
    intent: 'secondary',
    children: 'Filter',
  },
};

export const KioskBlock: Story = {
  args: {
    surface: 'kiosk',
    block: true,
    size: 'lg',
    children: 'Pay now',
  },
};
