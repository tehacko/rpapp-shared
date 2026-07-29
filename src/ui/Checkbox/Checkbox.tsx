import { forwardRef, type InputHTMLAttributes } from 'react';

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  readonly label?: string;
};

/**
 * CMP-0006 Checkbox — native control.
 * D27: Checkbox = independent multi-selection. Use Switch for binary on/off;
 * Radio for mutually exclusive choice among 2–5 options.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...rest }, ref) => {
    const input = (
      <input
        ref={ref}
        id={id}
        type="checkbox"
        className={[
          'h-4 w-4 rounded border-[var(--color-border,var(--color-an-border))]',
          'accent-[var(--color-action-primary,var(--color-an-primary))]',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      />
    );
    if (!label) {
      return input;
    }
    return (
      <label
        className="inline-flex items-center gap-2 text-sm text-[var(--color-on-surface,var(--color-an-text))]"
        htmlFor={id}
      >
        {input}
        <span>{label}</span>
      </label>
    );
  },
);
Checkbox.displayName = 'Checkbox';
