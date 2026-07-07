import type { Meta, StoryObj } from '@storybook/react';
import { FormField } from './FormField.js';

const meta = {
  title: 'UI/FormField',
  component: FormField,
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    surface: 'customer',
  },
} satisfies Meta<typeof FormField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CustomerDefault: Story = {};

export const AdminDefault: Story = {
  args: {
    surface: 'admin',
    label: 'Filter name',
    placeholder: 'Search…',
  },
};

export const KioskDefault: Story = {
  args: {
    surface: 'kiosk',
    label: 'Phone number',
    placeholder: '+420 …',
  },
};

export const WithHelper: Story = {
  args: {
    helperText: 'We never share your email.',
  },
};

export const WithError: Story = {
  args: {
    errorText: 'Email is required',
  },
};

export const AdminWithError: Story = {
  args: {
    surface: 'admin',
    label: 'Tenant code',
    errorText: 'Tenant code is required',
  },
};
