import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card.js';

const meta = {
  title: 'UI/Card',
  component: Card,
  args: {
    surface: 'customer',
    padded: true,
    elevated: false,
    children: 'Order summary and payment details appear inside this card.',
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CustomerDefault: Story = {};

export const AdminElevated: Story = {
  args: {
    surface: 'admin',
    elevated: true,
    children: 'Admin panel section with elevated surface.',
  },
};

export const KioskCompact: Story = {
  args: {
    surface: 'kiosk',
    padded: false,
    children: 'Kiosk card without default padding.',
  },
};
