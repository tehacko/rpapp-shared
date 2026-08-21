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
    expect(bar.className).toContain('pointer-events-auto');
    expect(bar.className).toContain('min-w-min');
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

    const openCart = screen.getByTestId('bottom-cart-bar-open');
    expect(openCart.className).toContain(
      'focus-visible:outline-[var(--color-accent-foreground)]',
    );

    const pay = screen.getByTestId('bottom-cart-bar-pay');
    expect(pay.className).toContain('bg-[var(--cart-bar-cta,#C9A84C)]');
    expect(pay.className).toContain(
      'focus-visible:outline-[var(--color-accent-foreground)]',
    );
    expect(pay.className).not.toContain('bg-[var(--color-accent)]');
  });

  it('compact: rounded-2xl theme-inverse accent bar; pay CTA opposite of bar', () => {
    render(<BottomCartBar {...baseProps} appearance="compact" />);

    const bar = screen.getByTestId('bottom-cart-bar');
    expect(bar).toHaveAttribute('data-appearance', 'compact');
    expect(bar.className).toContain('pointer-events-auto');
    expect(bar.className).toContain('min-w-min');
    expect(bar.className).toContain('rounded-2xl');
    expect(bar.className).toContain('h-[68px]');
    expect(bar.className).toContain('box-border');
    expect(bar.className).toContain('bg-[var(--color-accent)]');
    expect(bar.className).toContain('text-[var(--color-accent-foreground)]');
    expect(bar.className).toContain('shadow-[var(--shadow-popover)]');
    expect(bar.className).not.toContain('bg-[var(--color-surface-elevated)]');
    expect(bar.className).not.toContain('border-[var(--color-border)]');
    expect(bar.className).not.toContain('shadow-[var(--shadow-card)]');
    expect(bar.className).not.toContain('rounded-[999px]');

    const price = screen.getByText('60 Kč');
    expect(price.className).toContain('text-base');
    expect(price.className).toContain('tabular-nums');
    expect(price.className).not.toContain('text-[24px]');

    const openCart = screen.getByTestId('bottom-cart-bar-open');
    expect(openCart.className).toContain(
      'focus-visible:outline-[var(--color-accent-foreground)]',
    );

    const pay = screen.getByTestId('bottom-cart-bar-pay');
    expect(pay.className).toContain('bg-[var(--customer-cart-bar-pay-bg,#ffffff)]');
    expect(pay.className).toContain('text-[var(--customer-cart-bar-pay-fg,#000000)]');
    expect(pay.className).toContain(
      'focus-visible:outline-[var(--color-accent-foreground)]',
    );
    expect(pay.className).not.toContain('bg-[var(--color-accent)]');
    expect(pay.className).not.toContain('text-[var(--color-accent-foreground)]');
  });

  it('panel: Card elevated surface, no floating margins; accent pay CTA', () => {
    render(<BottomCartBar {...baseProps} appearance="panel" />);

    const bar = screen.getByTestId('bottom-cart-bar');
    expect(bar).toHaveAttribute('data-appearance', 'panel');
    expect(bar.className).toContain('pointer-events-auto');
    expect(bar.className).toContain('w-full');
    expect(bar.className).toContain('rounded-xl');
    expect(bar.className).toContain('border-[var(--color-border)]');
    expect(bar.className).toContain('bg-[var(--color-surface-elevated)]');
    expect(bar.className).toContain('text-[var(--color-on-surface)]');
    expect(bar.className).toContain('shadow-[var(--shadow-card)]');
    expect(bar.className).toContain('mx-0');
    expect(bar.className).toContain('mb-0');
    expect(bar.className).not.toContain('rounded-[999px]');
    expect(bar.className).not.toContain('rounded-2xl');
    expect(bar.className).not.toContain('h-[68px]');
    expect(bar.className).not.toContain('h-[76px]');

    const price = screen.getByText('60 Kč');
    expect(price.className).toContain('text-base');
    expect(price.className).toContain('tabular-nums');

    const openCart = screen.getByTestId('bottom-cart-bar-open');
    expect(openCart.className).toContain(
      'focus-visible:outline-[var(--color-accent)]',
    );

    const pay = screen.getByTestId('bottom-cart-bar-pay');
    expect(pay.className).toContain('bg-[var(--color-accent)]');
    expect(pay.className).toContain('text-[var(--color-accent-foreground)]');
    expect(pay.className).not.toContain('bg-[var(--customer-cart-bar-pay-bg,#ffffff)]');
  });

  it('AC-06: compact Czech price at 320px — full price visible, disabled pay uses cart-bar-cta-disabled', () => {
    const czechProps = {
      ...baseProps,
      appearance: 'compact' as const,
      priceLabel: '1 234,50 Kč',
      itemCountLabel: '5 položek',
    };

    const { rerender } = render(
      <div style={{ width: 320 }}>
        <BottomCartBar {...czechProps} payDisabled />
      </div>,
    );

    const count = screen.getByText('5 položek');
    expect(count).toBeVisible();

    const price = screen.getByText('1 234,50 Kč');
    expect(price).toBeVisible();
    expect(price.textContent).toBe('1 234,50 Kč');

    const bar = screen.getByTestId('bottom-cart-bar');
    expect(bar.className).toContain('min-w-min');
    expect(count.parentElement?.className).toContain('min-w-min');

    // jsdom cannot layout Tailwind: scrollWidth/clientWidth are 0 (equal stubs
    // like 72===72 are tautological and banned). Overflow proof is class
    // contracts that FAIL if the anti-clip tokens are removed from markup.
    expect(price.className).toContain('w-max');
    expect(price.className).toContain('whitespace-nowrap');
    expect(price.className).not.toContain('truncate');
    expect(price.className).not.toContain('min-w-0');
    expect(price.className).not.toContain('overflow-hidden');

    expect(count.className).toContain('overflow-hidden');
    expect(count.className).toContain('whitespace-nowrap');
    expect(count.className).toContain('max-w-[11rem]');
    expect(count.className).toContain('max-[389px]:max-w-[9rem]');
    expect(count.className).not.toContain('truncate');
    expect(count.className).not.toContain('min-w-0');
    expect(count.className).not.toContain('text-ellipsis');
    expect(count.className).not.toContain('w-max');

    const disabledPay = screen.getByTestId('bottom-cart-bar-pay');
    expect(disabledPay).toBeDisabled();
    expect(disabledPay.className).toContain(
      'bg-[var(--cart-bar-cta-disabled,#B0B0B0)]',
    );
    expect(disabledPay.className).toContain(
      'text-[var(--cart-bar-cta-disabled-fg,#111111)]',
    );
    expect(disabledPay.className).not.toContain(
      'bg-[var(--customer-cart-bar-pay-bg,#ffffff)]',
    );

    rerender(
      <div style={{ width: 320 }}>
        <BottomCartBar {...czechProps} payDisabled={false} />
      </div>,
    );

    const enabledPay = screen.getByTestId('bottom-cart-bar-pay');
    expect(enabledPay).toBeEnabled();
    expect(enabledPay.className).toContain(
      'focus-visible:outline-[var(--color-accent-foreground)]',
    );
    expect(enabledPay.className).toContain(
      'bg-[var(--customer-cart-bar-pay-bg,#ffffff)]',
    );

    const openCart = screen.getByTestId('bottom-cart-bar-open');
    expect(openCart.className).toContain('min-w-min');
    expect(openCart.className).toContain(
      'focus-visible:outline-[var(--color-accent-foreground)]',
    );
  });
});
