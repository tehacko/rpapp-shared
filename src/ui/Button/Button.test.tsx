/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button.js';

describe('Button', () => {
  it('renders children and defaults to type button', () => {
    render(<Button surface="admin">Save</Button>);

    const el = screen.getByRole('button', { name: 'Save' });
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('type', 'button');
  });

  it('applies admin intent and size variant classes', () => {
    render(
      <Button surface="admin" intent="secondary" size="sm">
        Filter
      </Button>
    );

    const el = screen.getByRole('button', { name: 'Filter' });
    expect(el.className).toContain('text-xs');
    expect(el.className).toContain('h-8');
    expect(el.className).toContain('border-[var(--color-gray-300)]');
  });

  it('preserves label space while loading', () => {
    render(
      <Button surface="admin" loading>
        Save changes
      </Button>
    );

    const el = screen.getByRole('button', { name: 'Save changes' });
    expect(el).toHaveAttribute('data-loading', 'true');
    expect(el).toBeDisabled();
    expect(el).toHaveAttribute('aria-busy', 'true');
    expect(el.textContent).toContain('Save changes');
  });

  it('requires accessible name for icon-only and sets native title tooltip', () => {
    render(
      <Button surface="admin" iconOnly aria-label="Close panel">
        ×
      </Button>
    );

    const el = screen.getByRole('button', { name: 'Close panel' });
    expect(el).toHaveAttribute('data-icon-only', 'true');
    expect(el).toHaveAttribute('title', 'Close panel');
    expect(el.className).toContain('min-h-[44px]');
  });

  it('applies block width when block is true', () => {
    render(
      <Button surface="customer" block>
        Full width
      </Button>
    );

    const el = screen.getByRole('button', { name: 'Full width' });
    expect(el.className).toContain('w-full');
    expect(el.className).toContain('max-w-sm');
    expect(el.className).toContain('mx-auto');
  });

  it('caps customer button width even without block', () => {
    render(
      <Button surface="customer" className="w-full">
        Stretched
      </Button>
    );

    expect(screen.getByRole('button', { name: 'Stretched' }).className).toContain('max-w-sm');
  });

  it('forwards click handlers', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();

    render(
      <Button surface="kiosk" onClick={onClick}>
        Click me
      </Button>
    );
    await user.click(screen.getByRole('button', { name: 'Click me' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('respects disabled state', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();

    render(
      <Button surface="customer" disabled onClick={onClick}>
        Disabled
      </Button>
    );

    const el = screen.getByRole('button', { name: 'Disabled' });
    expect(el).toBeDisabled();

    await user.click(el);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies pickup surface theme token classes', () => {
    render(
      <Button surface="pickup" intent="primary">
        Confirm
      </Button>
    );

    const el = screen.getByRole('button', { name: 'Confirm' });
    expect(el.className).toContain('bg-[var(--color-accent)]');
    expect(el.className).toContain('rounded-[var(--radius-lg)]');
    expect(el.className).toContain('h-11');
  });
});
