import { tv, type VariantProps } from '../tvShim.js';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

const adminButton = tv({
  base: [
    'inline-flex items-center justify-center gap-2',
    'rounded-md font-semibold font-[inherit] leading-snug',
    'transition-[background,border-color,color,box-shadow,transform,filter] duration-150',
    'focus-visible:outline-2 focus-visible:outline-offset-2',
    'focus-visible:outline-[var(--color-an-primary)]',
    'disabled:cursor-not-allowed disabled:opacity-55',
    'disabled:transform-none disabled:shadow-none',
  ].join(' '),
  variants: {
    intent: {
      primary: [
        'border-0 bg-[var(--color-an-primary)] text-white shadow-sm',
        'hover:brightness-95 hover:-translate-y-px',
        'hover:shadow-[0_4px_12px_rgba(99,102,241,0.35)]',
      ].join(' '),
      secondary: [
        'border border-[var(--color-gray-300)] bg-[var(--color-gray-200)]',
        'text-[var(--color-gray-800)] shadow-sm',
        'hover:border-[var(--color-an-primary)] hover:bg-[var(--color-an-primary-soft)]',
        'hover:text-[var(--color-an-primary)]',
        'hover:shadow-[0_2px_6px_rgba(99,102,241,0.2)]',
      ].join(' '),
      ghost: [
        'border border-[var(--color-an-border)] bg-[var(--color-an-surface)]',
        'text-[var(--color-an-text)]',
        'hover:border-[var(--color-an-primary)] hover:bg-[var(--color-an-primary-soft)]',
        'hover:text-[var(--color-an-primary)]',
      ].join(' '),
      danger: [
        'border-0 bg-[var(--color-an-danger)] text-white shadow-sm',
        'hover:opacity-90',
      ].join(' '),
      success: '',
    },
    size: {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base',
      xl: '',
    },
    block: {
      true: 'w-full',
      false: '',
    },
  },
  defaultVariants: {
    intent: 'primary',
    size: 'md',
    block: false,
  },
});

const kioskButton = tv({
  base: [
    'inline-flex items-center justify-center gap-2',
    'rounded-lg font-semibold transition-colors duration-150',
    'focus-visible:outline-2 focus-visible:outline-offset-2',
    'focus-visible:outline-[var(--color-focus-ring)]',
    'disabled:cursor-not-allowed disabled:opacity-60',
    'select-none touch-manipulation',
  ].join(' '),
  variants: {
    intent: {
      primary:
        'bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:opacity-90 active:opacity-80 shadow-sm',
      secondary:
        'bg-[var(--color-surface-muted)] text-[var(--color-on-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)]',
      ghost:
        'bg-transparent text-[var(--color-on-surface)] hover:bg-[var(--color-surface-muted)]',
      danger:
        'bg-[var(--color-danger)] text-white hover:opacity-90 active:opacity-80 shadow-sm',
      success:
        'bg-[var(--color-success)] text-white hover:opacity-90 active:opacity-80 shadow-sm',
    },
    size: {
      sm: 'h-10 px-3 text-sm',
      md: 'h-12 px-4 text-base',
      lg: 'h-14 px-6 text-lg',
      xl: 'h-16 px-8 text-xl',
    },
    block: {
      true: 'w-full',
      false: '',
    },
  },
  defaultVariants: {
    intent: 'primary',
    size: 'lg',
    block: false,
  },
});

const pickupButton = tv({
  base: [
    'inline-flex items-center justify-center gap-2',
    'rounded-[var(--radius-lg)] font-medium transition-opacity duration-150',
    'focus-visible:outline-2 focus-visible:outline-offset-2',
    'focus-visible:outline-[var(--color-focus-ring)]',
    'disabled:cursor-not-allowed disabled:opacity-55',
    'select-none touch-manipulation',
  ].join(' '),
  variants: {
    intent: {
      primary:
        'border-0 bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:opacity-90 active:opacity-80 shadow-sm',
      secondary:
        'bg-[var(--color-surface)] text-[var(--color-on-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)]',
      ghost:
        'bg-transparent text-[var(--color-on-surface)] hover:bg-[var(--color-surface-muted)]',
      danger:
        'bg-[var(--color-danger)] text-[var(--color-danger-foreground)] hover:opacity-90 active:opacity-80 shadow-sm',
      success:
        'bg-[var(--color-success)] text-[var(--color-success-foreground)] hover:opacity-90 active:opacity-80 shadow-sm',
    },
    size: {
      sm: 'h-10 px-3 text-sm',
      md: 'h-11 px-4 text-base',
      lg: 'h-12 px-5 text-lg',
      xl: 'h-14 px-6 text-xl',
    },
    block: {
      true: 'w-full',
      false: '',
    },
  },
  defaultVariants: {
    intent: 'primary',
    size: 'md',
    block: false,
  },
});

const customerButton = tv({
  base: [
    'inline-flex items-center justify-center gap-2',
    'rounded-md font-medium transition-colors duration-150',
    'focus-visible:outline-2 focus-visible:outline-offset-2',
    'focus-visible:outline-[var(--color-focus-ring)]',
    'disabled:cursor-not-allowed disabled:opacity-60',
  ].join(' '),
  variants: {
    intent: {
      primary:
        'bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:opacity-90',
      secondary:
        'bg-[var(--color-surface-muted)] text-[var(--color-on-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)]',
      ghost:
        'bg-transparent text-[var(--color-on-surface)] hover:bg-[var(--color-surface-muted)]',
      danger:
        'bg-[var(--color-danger)] text-[var(--color-danger-foreground)] hover:opacity-90',
      success: '',
    },
    size: {
      sm: 'h-9 px-3 text-sm',
      md: 'h-11 px-4 text-base',
      lg: 'h-12 px-5 text-lg',
      xl: '',
    },
    block: {
      true: 'w-full',
      false: '',
    },
  },
  defaultVariants: {
    intent: 'primary',
    size: 'md',
    block: false,
  },
});

type Surface = 'admin' | 'kiosk' | 'customer' | 'pickup';

type AdminVariants = VariantProps<typeof adminButton>;
type KioskVariants = VariantProps<typeof kioskButton>;
type CustomerVariants = VariantProps<typeof customerButton>;
type PickupVariants = VariantProps<typeof pickupButton>;

type SharedIntent = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type SharedSize = 'sm' | 'md' | 'lg' | 'xl';

function buttonClassName(
  surface: Surface,
  intent: SharedIntent | undefined,
  size: SharedSize | undefined,
  block: boolean | undefined,
  className: string | undefined
): string {
  const resolvedIntent = intent ?? 'primary';
  const resolvedBlock = block ?? false;

  if (surface === 'admin') {
    const adminIntent =
      resolvedIntent === 'success' ? 'primary' : (resolvedIntent as AdminVariants['intent']);
    const adminSize = size === 'xl' ? 'lg' : (size as AdminVariants['size']);
    return adminButton({ intent: adminIntent, size: adminSize, block: resolvedBlock, className });
  }

  if (surface === 'kiosk') {
    return kioskButton({
      intent: resolvedIntent as KioskVariants['intent'],
      size: size as KioskVariants['size'],
      block: resolvedBlock,
      className,
    });
  }

  if (surface === 'pickup') {
    return pickupButton({
      intent: resolvedIntent as PickupVariants['intent'],
      size: size as PickupVariants['size'],
      block: resolvedBlock,
      className,
    });
  }

  const customerIntent =
    resolvedIntent === 'success' ? 'primary' : (resolvedIntent as CustomerVariants['intent']);
  const customerSize = size === 'xl' ? 'lg' : (size as CustomerVariants['size']);
  return customerButton({
    intent: customerIntent,
    size: customerSize,
    block: resolvedBlock,
    className,
  });
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  readonly surface?: Surface;
  readonly intent?: SharedIntent;
  readonly size?: SharedSize;
  readonly block?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, surface = 'customer', intent, size, block, ...rest }, ref) => (
    <button
      ref={ref}
      type={rest.type ?? 'button'}
      className={buttonClassName(surface, intent, size, block, className)}
      {...rest}
    />
  )
);
Button.displayName = 'Button';
