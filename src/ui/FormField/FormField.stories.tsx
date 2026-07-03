import type { Meta, StoryObj } from '@storybook/react';
import { FormField } from './FormField.js';

const meta = {
  title: 'UI/FormField',
  component: FormField,
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
  },
} satisfies Meta<typeof FormField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

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
