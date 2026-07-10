import { forwardRef, type HTMLAttributes } from 'react';
import { tv, type VariantProps } from '../tvShim.js';

const adminCard = tv({
  base: [
    'rp-card-container',
    'rounded-lg border border-[var(--color-an-border)]',
    'bg-[var(--color-an-surface)] text-[var(--color-an-text)]',
    'shadow-sm',
  ].join(' '),
  variants: {
    padded: {
      true: 'p-4 sm:p-6',
      false: 'p-0',
    },
    elevated: {
      true: 'bg-[var(--color-an-bg-elevated)]',
      false: '',
    },
  },
  defaultVariants: {
    padded: true,
    elevated: false,
  },
});

const pickupCard = tv({
  base: [
    'rp-card-container',
    'rounded-[var(--radius-xl)] bg-[var(--color-surface-elevated)]',
    'shadow-[var(--shadow-card)]',
  ].join(' '),
  variants: {
    padded: {
      true: 'p-4 sm:p-5',
      false: 'p-0',
    },
    elevated: {
      true: 'shadow-[var(--shadow-popover)]',
      false: '',
    },
  },
  defaultVariants: {
    padded: true,
    elevated: false,
  },
});

const kioskCustomerCard = tv({
  base: [
    'rp-card-container',
    'rounded-xl border bg-[var(--color-surface-elevated)]',
    'border-[var(--color-border)] shadow-[var(--shadow-card)]',
  ].join(' '),
  variants: {
    padded: {
      true: 'p-4 sm:p-6',
      false: 'p-0',
    },
    elevated: {
      true: 'shadow-[var(--shadow-popover)]',
      false: '',
    },
  },
  defaultVariants: {
    padded: true,
    elevated: false,
  },
});

type CardSurface = 'admin' | 'kiosk' | 'customer' | 'pickup';

type AdminCardVariants = VariantProps<typeof adminCard>;
type PickupCardVariants = VariantProps<typeof pickupCard>;
type KioskCustomerCardVariants = VariantProps<typeof kioskCustomerCard>;

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  readonly surface?: CardSurface;
  readonly padded?: boolean;
  readonly elevated?: boolean;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, surface = 'customer', padded, elevated, children, ...rest }, ref) => {
    if (surface === 'admin') {
      return (
        <div
          ref={ref}
          className={adminCard({ padded, elevated, className } as AdminCardVariants & {
            className?: string;
          })}
          {...rest}
        >
          <div className="rp-card-container-inner">{children}</div>
        </div>
      );
    }

    if (surface === 'pickup') {
      return (
        <div
          ref={ref}
          className={pickupCard({ padded, elevated, className } as PickupCardVariants & {
            className?: string;
          })}
          {...rest}
        >
          <div className="rp-card-container-inner">{children}</div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={kioskCustomerCard({
          padded,
          elevated,
          className,
        } as KioskCustomerCardVariants & { className?: string })}
        {...rest}
      >
        <div className="rp-card-container-inner">{children}</div>
      </div>
    );
  }
);
Card.displayName = 'Card';
