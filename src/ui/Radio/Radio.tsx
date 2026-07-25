import { forwardRef, type InputHTMLAttributes } from 'react';

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  readonly label?: string;
};

/** CMP-0007 Radio — native control. */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, id, ...rest }, ref) => {
    const input = (
      <input
        ref={ref}
        id={id}
        type="radio"
        className={[
          'h-4 w-4 border-[var(--color-border,var(--color-an-border))]',
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
Radio.displayName = 'Radio';
