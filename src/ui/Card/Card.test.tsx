/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { Card } from './Card.js';

describe('Card', () => {
  it('renders children with default customer surface', () => {
    render(<Card>Order summary</Card>);

    expect(screen.getByText('Order summary')).toBeInTheDocument();
  });

  it('applies admin elevated variant classes', () => {
    const { container } = render(
      <Card surface="admin" elevated>
        Admin section
      </Card>
    );

    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('bg-[var(--color-an-bg-elevated)]');
  });

  it('applies pickup surface theme token classes', () => {
    const { container } = render(
      <Card surface="pickup" padded>
        Fulfillment panel
      </Card>
    );

    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('rounded-[var(--radius-xl)]');
    expect(el.className).toContain('bg-[var(--color-surface-elevated)]');
    expect(el.className).toContain('shadow-[var(--shadow-card)]');
  });

  it('omits padding when padded is false', () => {
    const { container } = render(
      <Card surface="pickup" padded={false}>
        Compact
      </Card>
    );

    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('p-0');
  });
});
