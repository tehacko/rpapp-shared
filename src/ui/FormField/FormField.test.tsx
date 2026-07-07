/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { FormField } from './FormField.js';

describe('FormField', () => {
  it('defaults to customer surface and uses theme.css tokens', () => {
    render(<FormField label="Email" />);

    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input.className).toContain('text-[var(--color-on-surface)]');
    expect(input.className).toContain('border-[var(--color-border)]');
    expect(input.className).not.toContain('--color-an-text');
  });

  it('applies admin surface tokens', () => {
    render(<FormField label="Email" surface="admin" />);

    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input.className).toContain('text-[var(--color-an-text)]');
    expect(input.className).toContain('border-[var(--color-an-border)]');
    expect(input.className).not.toContain('--color-on-surface');
  });

  it('applies kiosk touch sizing with consumer tokens', () => {
    render(<FormField label="Phone" surface="kiosk" />);

    const input = screen.getByRole('textbox', { name: 'Phone' });
    expect(input.className).toContain('h-12');
    expect(input.className).toContain('text-[var(--color-on-surface)]');
  });

  it('renders helper text with consumer muted token', () => {
    render(<FormField label="Email" helperText="We never share your email." />);

    const helper = screen.getByText('We never share your email.');
    expect(helper).toHaveAttribute('id');
    expect(helper.className).toContain('text-[var(--color-on-surface-muted)]');
  });

  it('renders error text and marks input invalid', () => {
    render(<FormField label="Email" errorText="Email is required" />);

    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.className).toContain('border-[var(--color-danger)]');

    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent('Email is required');
    expect(error.className).toContain('text-[var(--color-danger)]');
  });

  it('renders admin error with admin danger token', () => {
    render(<FormField label="Email" surface="admin" errorText="Required" />);

    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input.className).toContain('border-[var(--color-an-danger)]');

    const error = screen.getByRole('alert');
    expect(error.className).toContain('text-[var(--color-an-danger)]');
  });
});
