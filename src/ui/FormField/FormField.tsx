import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { tv } from '../tvShim.js';

export type FormFieldSurface = 'admin' | 'customer' | 'kiosk' | 'pickup';

const adminField = tv({
  slots: {
    wrapper: 'flex flex-col gap-1.5 w-full',
    label: 'text-sm font-medium text-[var(--color-an-text)]',
    input: [
      'h-10 w-full rounded-md border bg-[var(--color-an-surface)] px-3 text-sm',
      'border-[var(--color-an-border)] text-[var(--color-an-text)]',
      'placeholder:text-[var(--color-an-text-muted)]',
      'focus-visible:outline-none focus-visible:border-[var(--color-an-primary)]',
      'disabled:cursor-not-allowed disabled:opacity-60',
    ].join(' '),
    helper: 'text-xs text-[var(--color-an-text-muted)]',
    error: 'text-xs text-[var(--color-an-danger)]',
  },
  variants: {
    invalid: {
      true: { input: 'border-[var(--color-an-danger)]' },
      false: {},
    },
  },
  defaultVariants: { invalid: false },
});

const consumerField = tv({
  slots: {
    wrapper: 'flex flex-col gap-1.5 w-full',
    label: 'text-sm font-medium text-[var(--color-on-surface)]',
    input: [
      'w-full rounded-md border bg-[var(--color-surface)] px-3',
      'border-[var(--color-border)] text-[var(--color-on-surface)]',
      'placeholder:text-[var(--color-on-surface-muted)]',
      'focus-visible:outline-none focus-visible:border-[var(--color-focus-ring)]',
      'disabled:cursor-not-allowed disabled:opacity-60',
    ].join(' '),
    helper: 'text-xs text-[var(--color-on-surface-muted)]',
    error: 'text-xs text-[var(--color-danger)]',
  },
  variants: {
    surface: {
      customer: { input: 'h-11 text-base' },
      kiosk: { input: 'h-12 text-base' },
      pickup: { input: 'h-11 text-[15px]' },
    },
    invalid: {
      true: { input: 'border-[var(--color-danger)]' },
      false: {},
    },
  },
  defaultVariants: { invalid: false },
});

export interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label: string;
  readonly surface?: FormFieldSurface;
  readonly helperText?: string;
  readonly errorText?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    { label, surface = 'customer', helperText, errorText, id: providedId, ...rest },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId ?? `field-${generatedId}`;
    const helperId = `${id}-helper`;
    const errorId = `${id}-error`;
    const invalid = errorText !== undefined && errorText.length > 0;
    const slots =
      surface === 'admin'
        ? adminField({ invalid })
        : consumerField({ surface, invalid });

    let describedBy: string | undefined;
    if (invalid) {
      describedBy = errorId;
    } else if (helperText !== undefined) {
      describedBy = helperId;
    }

    return (
      <div className={slots.wrapper()}>
        <label htmlFor={id} className={slots.label()}>
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          aria-invalid={invalid ? 'true' : 'false'}
          aria-describedby={describedBy}
          className={slots.input()}
          {...rest}
        />
        {invalid ? (
          <span id={errorId} role="alert" className={slots.error()}>
            {errorText}
          </span>
        ) : null}
        {!invalid && helperText !== undefined ? (
          <span id={helperId} className={slots.helper()}>
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);
FormField.displayName = 'FormField';
