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

    const label = screen.getByText('Email');
    expect(label.className).toContain('font-medium');
    expect(label.className).not.toContain('font-semibold');
  });

  it('applies admin surface tokens', () => {
    render(<FormField label="Email" surface="admin" />);

    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input.className).toContain('text-[var(--color-an-text)]');
    expect(input.className).toContain('border-[var(--color-an-border)]');
    expect(input.className).not.toContain('--color-on-surface');

    const label = screen.getByText('Email');
    expect(label.className).toContain('font-semibold');
    expect(label.className).not.toContain('font-medium');
  });

  it('applies kiosk touch sizing with consumer tokens', () => {
    render(<FormField label="Phone" surface="kiosk" />);

    const input = screen.getByRole('textbox', { name: 'Phone' });
    expect(input.className).toContain('h-12');
    expect(input.className).toContain('text-[var(--color-on-surface)]');
  });

  it('renders helper text with consumer muted token', () => {
    const helperText = 'Helper copy';
    render(<FormField label="Email" helperText={helperText} />);

    const helper = screen.getByText(helperText);
    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(helper).toHaveAttribute('id');
    expect(helper.className).toContain('text-[var(--color-on-surface-muted)]');
    expect(input).toHaveAttribute('aria-describedby', helper.getAttribute('id') ?? '');
  });

  it('renders error text and marks input invalid', () => {
    const errorText = 'Required value';
    render(<FormField label="Email" errorText={errorText} />);

    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.className).toContain('border-[var(--color-danger)]');

    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent(errorText);
    expect(input).toHaveAttribute('aria-describedby', error.getAttribute('id') ?? '');
    expect(error.className).toContain('text-[var(--color-danger)]');
  });

  it('renders admin error with admin danger token', () => {
    render(<FormField label="Email" surface="admin" errorText="Required" />);

    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input.className).toContain('border-[var(--color-an-danger)]');

    const error = screen.getByRole('alert');
    expect(error.className).toContain('text-[var(--color-an-danger)]');
  });

  it('appends required marker and aria-required when required=true', () => {
    render(<FormField label="Amount" required />);

    expect(screen.getByText((_, el) => el?.tagName === 'LABEL' && el.textContent === 'Amount *')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Amount *' })).toHaveAttribute('aria-required', 'true');
  });

  it('wraps a custom child control with field a11y props', () => {
    const errorText = 'Control validation failed';
    render(
      <FormField label="Note" errorText={errorText}>
        <textarea data-testid="note-area" />
      </FormField>,
    );

    const area = screen.getByTestId('note-area');
    expect(area).toHaveAttribute('aria-invalid', 'true');
    expect(area).toHaveAttribute('id');
    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent(errorText);
    expect(area).toHaveAttribute('aria-describedby', error.getAttribute('id') ?? '');
  });
});
