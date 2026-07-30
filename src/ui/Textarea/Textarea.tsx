import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { tv, type VariantProps } from '../tvShim.js';

const textarea = tv({
  base: [
    'min-h-[5rem] w-full rounded-md border px-3 py-2 text-sm',
    'border-[var(--color-border,var(--color-an-border))]',
    'bg-[var(--color-surface,var(--color-an-surface))]',
    'text-[var(--color-on-surface,var(--color-an-text))]',
    'placeholder:text-[var(--color-on-surface-muted,var(--color-an-text-muted))]',
    'focus-visible:outline-2 focus-visible:outline-offset-2',
    'focus-visible:outline-[var(--color-focus-ring,var(--color-an-primary))]',
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

type TextareaVariants = VariantProps<typeof textarea>;

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & TextareaVariants;

/** CMP-0023 Textarea */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...rest }, ref) => (
    <textarea ref={ref} className={textarea({ invalid, className })} {...rest} />
  ),
);
Textarea.displayName = 'Textarea';
