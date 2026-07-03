import { forwardRef, type HTMLAttributes } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

const adminCard = tv({
  base: [
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

const kioskCustomerCard = tv({
  base: [
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

type CardSurface = 'admin' | 'kiosk' | 'customer';

type AdminCardVariants = VariantProps<typeof adminCard>;
type KioskCustomerCardVariants = VariantProps<typeof kioskCustomerCard>;

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  readonly surface?: CardSurface;
  readonly padded?: boolean;
  readonly elevated?: boolean;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, surface = 'customer', padded, elevated, ...rest }, ref) => {
    if (surface === 'admin') {
      return (
        <div
          ref={ref}
          className={adminCard({ padded, elevated, className } as AdminCardVariants & {
            className?: string;
          })}
          {...rest}
        />
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
      />
    );
  }
);
Card.displayName = 'Card';
