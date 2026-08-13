import {
  cloneElement,
  forwardRef,
  isValidElement,
  useId,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { tv } from '../tvShim.js';

export type FormFieldSurface = 'admin' | 'customer' | 'kiosk' | 'pickup';

const adminField = tv({
  slots: {
    wrapper: 'flex flex-col gap-1.5 w-full',
    label: 'text-sm font-semibold text-[var(--color-an-text)]',
    input: [
      'h-10 w-full rounded-md border bg-[var(--color-an-surface)] px-3 text-sm',
      'border-[var(--color-an-border)] text-[var(--color-an-text)]',
      'placeholder:text-[var(--color-an-text-muted)]',
      'focus-visible:outline-2 focus-visible:outline-offset-2',
      'focus-visible:outline-[var(--color-an-focus-ring,var(--color-an-primary))]',
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
      'focus-visible:outline-2 focus-visible:outline-offset-2',
      'focus-visible:outline-[var(--color-focus-ring)]',
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

export interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'children'> {
  readonly label: string;
  readonly surface?: FormFieldSurface;
  readonly helperText?: string;
  readonly errorText?: string;
  /**
   * Custom control (e.g. Textarea). Receives `id`, `aria-*`, and invalid styling
   * props via clone. When omitted, FormField renders a default `<input>`.
   */
  readonly children?: ReactNode;
}

type ControlA11yProps = {
  id: string;
  'aria-invalid': 'true' | 'false';
  'aria-describedby'?: string;
  'aria-required'?: 'true';
};

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      surface = 'customer',
      helperText,
      errorText,
      id: providedId,
      required,
      children,
      ...rest
    },
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

    const controlA11y: ControlA11yProps = {
      id,
      'aria-invalid': invalid ? 'true' : 'false',
      ...(describedBy !== undefined ? { 'aria-describedby': describedBy } : {}),
      ...(required === true ? { 'aria-required': 'true' as const } : {}),
    };

    let control: ReactNode;
    if (children !== undefined && children !== null) {
      if (isValidElement(children)) {
        const child = children as ReactElement<Record<string, unknown>>;
        control = cloneElement(child, {
          ...controlA11y,
          ...(invalid ? { invalid: true } : {}),
        });
      } else {
        control = children;
      }
    } else {
      control = (
        <input
          ref={ref}
          className={slots.input()}
          required={required}
          {...rest}
          {...controlA11y}
        />
      );
    }

    return (
      <div className={slots.wrapper()}>
        <label htmlFor={id} className={slots.label()}>
          {label}
          {required === true ? ' *' : null}
        </label>
        {control}
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
