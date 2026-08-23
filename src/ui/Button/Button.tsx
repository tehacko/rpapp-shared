import { tv, type VariantProps } from '../tvShim.js';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

const adminButton = tv({
  base: [
    'relative inline-flex items-center justify-center gap-2',
    'rounded-md font-semibold font-[inherit] leading-snug',
    'transition-[background,border-color,color,box-shadow,transform,filter]',
    'duration-[var(--motion-duration-button,100ms)]',
    'ease-[var(--motion-ease-standard,cubic-bezier(0.4,0,0.2,1))]',
    'focus-visible:outline-2 focus-visible:outline-offset-2',
    'focus-visible:outline-[var(--color-an-primary)]',
    'disabled:cursor-not-allowed disabled:opacity-55',
    'disabled:transform-none disabled:shadow-none',
  ].join(' '),
  variants: {
    intent: {
      primary: [
        'border-0 bg-[var(--color-an-primary)] text-[var(--color-an-on-primary,#ffffff)] shadow-sm',
        'hover:brightness-95 hover:-translate-y-px',
        'hover:shadow-[0_4px_12px_rgba(24, 24, 27,0.35)]',
      ].join(' '),
      secondary: [
        'border border-[var(--color-gray-300)] bg-[var(--color-gray-200)]',
        'text-[var(--color-gray-800)] shadow-sm',
        'hover:border-[var(--color-an-primary)] hover:bg-[var(--color-an-primary-soft)]',
        'hover:text-[var(--color-an-primary)]',
        'hover:shadow-[0_2px_6px_rgba(24, 24, 27,0.2)]',
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
      /* Spec D8: 32 / 40 / 48 */
      sm: 'h-8 min-h-8 px-3 text-xs',
      md: 'h-10 min-h-10 px-4 text-sm',
      lg: 'h-12 min-h-12 px-5 text-base',
      xl: 'h-12 min-h-12 px-5 text-base',
    },
    block: {
      true: 'w-full',
      false: '',
    },
    iconOnly: {
      true: 'aspect-square px-0 min-h-[44px] min-w-[44px]',
      false: '',
    },
  },
  defaultVariants: {
    intent: 'primary',
    size: 'md',
    block: false,
    iconOnly: false,
  },
});

const kioskButton = tv({
  base: [
    'relative inline-flex items-center justify-center gap-2',
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
    iconOnly: {
      true: 'aspect-square px-0 min-h-[44px] min-w-[44px]',
      false: '',
    },
  },
  defaultVariants: {
    intent: 'primary',
    size: 'lg',
    block: false,
    iconOnly: false,
  },
});

const pickupButton = tv({
  base: [
    'relative inline-flex items-center justify-center gap-2',
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
    iconOnly: {
      true: 'aspect-square px-0 min-h-[44px] min-w-[44px]',
      false: '',
    },
  },
  defaultVariants: {
    intent: 'primary',
    size: 'md',
    block: false,
    iconOnly: false,
  },
});

/**
 * Customer CTA recipe — always caps width (max-w-sm / 24rem) so block / w-full
 * buttons never balloon across wide panels. Block also centers under the cap.
 * Escape hatch for rare full-bleed chrome: pass `className="max-w-none"`.
 */
const customerButton = tv({
  base: [
    'relative inline-flex items-center justify-center gap-2',
    'max-w-sm rounded-md font-medium transition-colors duration-150',
    'whitespace-nowrap',
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
      sm: 'h-8 min-h-8 px-3 text-sm',
      md: 'h-10 min-h-10 px-4 text-base',
      lg: 'h-12 min-h-12 px-5 text-lg',
      xl: 'h-12 min-h-12 px-5 text-lg',
    },
    block: {
      true: 'flex mx-auto w-full',
      false: '',
    },
    iconOnly: {
      true: 'aspect-square max-w-none px-0 min-h-[44px] min-w-[44px]',
      false: '',
    },
  },
  defaultVariants: {
    intent: 'primary',
    size: 'md',
    block: false,
    iconOnly: false,
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
  iconOnly: boolean | undefined,
  className: string | undefined
): string {
  const resolvedIntent = intent ?? 'primary';
  const resolvedBlock = block ?? false;
  const resolvedIconOnly = iconOnly ?? false;

  if (surface === 'admin') {
    const adminIntent =
      resolvedIntent === 'success' ? 'primary' : (resolvedIntent as AdminVariants['intent']);
    const adminSize = size === 'xl' ? 'lg' : (size as AdminVariants['size']);
    return adminButton({
      intent: adminIntent,
      size: adminSize,
      block: resolvedBlock,
      iconOnly: resolvedIconOnly,
      className,
    });
  }

  if (surface === 'kiosk') {
    return kioskButton({
      intent: resolvedIntent as KioskVariants['intent'],
      size: size as KioskVariants['size'],
      block: resolvedBlock,
      iconOnly: resolvedIconOnly,
      className,
    });
  }

  if (surface === 'pickup') {
    return pickupButton({
      intent: resolvedIntent as PickupVariants['intent'],
      size: size as PickupVariants['size'],
      block: resolvedBlock,
      iconOnly: resolvedIconOnly,
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
    iconOnly: resolvedIconOnly,
    className,
  });
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  readonly surface?: Surface;
  readonly intent?: SharedIntent;
  readonly size?: SharedSize;
  readonly block?: boolean;
  /** Shows spinner; preserves width via invisible label (no collapse). */
  readonly loading?: boolean;
  /**
   * Square icon button. Requires `aria-label` for accessible name.
   * No shared Tooltip primitive — uses native `title` (falls back to aria-label).
   */
  readonly iconOnly?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      surface = 'customer',
      intent,
      size,
      block,
      loading = false,
      iconOnly = false,
      children,
      disabled,
      type = 'button',
      'aria-label': ariaLabel,
      title,
      ...rest
    },
    ref
  ) => {
    const resolvedAriaLabel =
      ariaLabel ??
      (iconOnly ? title : undefined) ??
      (loading && typeof children === 'string' ? children : undefined);
    const tooltipTitle = title ?? (iconOnly ? resolvedAriaLabel : undefined);

    return (
      <button
        {...rest}
        ref={ref}
        type={type}
        className={buttonClassName(surface, intent, size, block, iconOnly, className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        aria-label={resolvedAriaLabel}
        title={tooltipTitle}
        data-icon-only={iconOnly ? 'true' : undefined}
        data-loading={loading ? 'true' : undefined}
      >
        {loading ? (
          <>
            <span className="invisible inline-flex items-center gap-2" aria-hidden="true">
              {children}
            </span>
            <span
              className="absolute inset-0 inline-flex items-center justify-center"
              aria-hidden="true"
            >
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';
