import { forwardRef, type InputHTMLAttributes } from 'react';
import { tv, type VariantProps } from '../tvShim.js';

const input = tv({
  base: [
    'h-10 w-full rounded-md border px-3 text-sm',
    'border-[var(--color-border,var(--color-an-border))]',
    'bg-[var(--color-surface,var(--color-an-surface))]',
    'text-[var(--color-on-surface,var(--color-an-text))]',
    'placeholder:text-[var(--color-on-surface-muted,var(--color-an-text-muted))]',
    'focus-visible:outline-none focus-visible:border-[var(--color-focus-ring,var(--color-an-primary))]',
    'disabled:cursor-not-allowed disabled:opacity-60',
  ].join(' '),
  variants: {
    invalid: {
      true: 'border-[var(--color-danger,var(--color-an-danger))]',
      false: '',
    },
  },
  defaultVariants: { invalid: false },
});

type InputVariants = VariantProps<typeof input>;

export type InputProps = InputHTMLAttributes<HTMLInputElement> & InputVariants;

/** CMP-0004 Input */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...rest }, ref) => (
    <input ref={ref} className={input({ invalid, className })} {...rest} />
  ),
);
Input.displayName = 'Input';
