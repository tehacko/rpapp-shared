/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { BottomCartBar } from './BottomCartBar.js';

const baseProps = {
  itemCountLabel: '2 items',
  priceLabel: '60 Kč',
  badgeCount: 2,
  payLabel: 'Pay',
  payDisabled: false,
  openCartAria: 'Open cart',
  payAria: 'Pay now',
  onOpenCart: jest.fn(),
  onPay: jest.fn(),
} as const;

describe('BottomCartBar appearance recipes', () => {
  it('defaults to pill: rounded-[999px] accent-filled bar (kiosk)', () => {
    render(<BottomCartBar {...baseProps} />);

    const bar = screen.getByTestId('bottom-cart-bar');
    expect(bar).toHaveAttribute('data-appearance', 'pill');
    expect(bar.className).toContain('rounded-[999px]');
    expect(bar.className).toContain('h-[76px]');
    expect(bar.className).toContain('bg-[var(--color-accent)]');
    expect(bar.className).toContain('text-[var(--color-accent-foreground)]');
    expect(bar.className).not.toContain('rounded-2xl');
    expect(bar.className).not.toContain('bg-[var(--color-surface-elevated)]');
    expect(bar.className).not.toContain('shadow-[var(--shadow-popover)]');

    const price = screen.getByText('60 Kč');
    expect(price.className).toContain('text-[24px]');
    expect(price.className).toContain('tabular-nums');
    expect(price.className).not.toContain('text-base');

    const pay = screen.getByTestId('bottom-cart-bar-pay');
    expect(pay.className).toContain('bg-[var(--cart-bar-cta,#C9A84C)]');
    expect(pay.className).not.toContain('bg-[var(--color-accent)]');
  });

  it('compact: rounded-2xl surface + shadow-popover; accent only on Pay CTA', () => {
    render(<BottomCartBar {...baseProps} appearance="compact" />);

    const bar = screen.getByTestId('bottom-cart-bar');
    expect(bar).toHaveAttribute('data-appearance', 'compact');
    expect(bar.className).toContain('rounded-2xl');
    expect(bar.className).toContain('h-[68px]');
    expect(bar.className).toContain('bg-[var(--color-surface-elevated)]');
    expect(bar.className).toContain('text-[var(--color-on-surface)]');
    expect(bar.className).toContain('shadow-[var(--shadow-popover)]');
    expect(bar.className).not.toContain('rounded-[999px]');
    expect(bar.className).not.toContain('bg-[var(--color-accent)]');

    const price = screen.getByText('60 Kč');
    expect(price.className).toContain('text-base');
    expect(price.className).toContain('tabular-nums');
    expect(price.className).not.toContain('text-[24px]');

    const pay = screen.getByTestId('bottom-cart-bar-pay');
    expect(pay.className).toContain('bg-[var(--color-accent)]');
    expect(pay.className).toContain('text-[var(--color-accent-foreground)]');
  });
});
