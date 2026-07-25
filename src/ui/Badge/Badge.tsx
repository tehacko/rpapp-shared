import { forwardRef, type HTMLAttributes } from 'react';
import { tv, type VariantProps } from '../tvShim.js';

const badge = tv({
  base: 'inline-flex items-center rounded-full font-semibold leading-none',
  variants: {
    tone: {
      neutral: '',
      primary: '',
      success: '',
      warn: '',
      danger: '',
      info: '',
    },
    size: {
      sm: 'px-2 py-0.5 text-[10px]',
      md: 'px-2.5 py-0.5 text-xs',
    },
    variant: {
      solid: '',
      outline: 'border bg-transparent',
    },
  },
  compoundVariants: [
    {
      tone: 'neutral',
      variant: 'solid',
      class: 'bg-[var(--color-surface-muted,var(--color-gray-200,#e5e7eb))] text-[var(--color-on-surface-muted,var(--color-gray-800,#1f2937))]',
    },
    {
      tone: 'neutral',
      variant: 'outline',
      class: 'border-[var(--color-border,var(--color-gray-300))] text-[var(--color-on-surface-muted)]',
    },
    {
      tone: 'primary',
      variant: 'solid',
      class:
        'bg-[var(--color-surface-soft,var(--color-an-primary-soft))] text-[var(--color-action-primary,var(--color-an-primary))]',
    },
    {
      tone: 'primary',
      variant: 'outline',
      class: 'border-[var(--color-action-primary,var(--color-an-primary))] text-[var(--color-action-primary,var(--color-an-primary))]',
    },
    {
      tone: 'success',
      variant: 'solid',
      class:
        'bg-[color-mix(in_oklab,var(--color-success,var(--color-an-success))_15%,transparent)] text-[var(--color-success,var(--color-an-success))]',
    },
    {
      tone: 'success',
      variant: 'outline',
      class: 'border-[var(--color-success,var(--color-an-success))] text-[var(--color-success,var(--color-an-success))]',
    },
    {
      tone: 'warn',
      variant: 'solid',
      class:
        'bg-[color-mix(in_oklab,var(--color-warning,var(--color-an-warn))_15%,transparent)] text-[var(--color-warning,var(--color-an-warn))]',
    },
    {
      tone: 'warn',
      variant: 'outline',
      class: 'border-[var(--color-warning,var(--color-an-warn))] text-[var(--color-warning,var(--color-an-warn))]',
    },
    {
      tone: 'danger',
      variant: 'solid',
      class:
        'bg-[color-mix(in_oklab,var(--color-danger,var(--color-an-danger))_15%,transparent)] text-[var(--color-danger,var(--color-an-danger))]',
    },
    {
      tone: 'danger',
      variant: 'outline',
      class: 'border-[var(--color-danger,var(--color-an-danger))] text-[var(--color-danger,var(--color-an-danger))]',
    },
    {
      tone: 'info',
      variant: 'solid',
      class: 'bg-[color-mix(in_oklab,var(--color-info,#0ea5e9)_15%,transparent)] text-[var(--color-info,#0ea5e9)]',
    },
    {
      tone: 'info',
      variant: 'outline',
      class: 'border-[var(--color-info,#0ea5e9)] text-[var(--color-info,#0ea5e9)]',
    },
  ],
  defaultVariants: { tone: 'neutral', size: 'md', variant: 'solid' },
});

type BadgeVariants = VariantProps<typeof badge>;

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & BadgeVariants;

/** CMP-0009 Badge — tones align STATUS registry. */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, tone, size, variant, ...rest }, ref) => (
    <span ref={ref} className={badge({ tone, size, variant, className })} {...rest} />
  ),
);
Badge.displayName = 'Badge';
