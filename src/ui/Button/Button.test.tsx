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
    expect(el.className).toContain('border-[var(--color-gray-300)]');
  });

  it('applies block width when block is true', () => {
    render(
      <Button surface="customer" block>
        Full width
      </Button>
    );

    expect(screen.getByRole('button', { name: 'Full width' }).className).toContain('w-full');
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
