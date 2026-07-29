import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { tv } from '../tvShim.js';

const switchTrack = tv({
  base: [
    'relative inline-flex h-[1.55rem] w-[2.85rem] shrink-0 cursor-pointer rounded-full',
    'bg-[var(--color-border,var(--color-an-border,#cbd5e1))] transition-[background-color] duration-150',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
    'focus-visible:outline-[var(--color-focus-ring,var(--color-an-primary))]',
    'disabled:cursor-not-allowed disabled:opacity-55',
  ].join(' '),
  variants: {
    checked: {
      true: 'bg-[var(--color-action-primary,var(--color-an-primary))]',
      false: '',
    },
  },
  defaultVariants: { checked: false },
});

const switchKnob = tv({
  base: [
    'pointer-events-none absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white',
    'shadow-[0_1px_3px_rgba(15,23,42,0.18)] transition-transform duration-150',
  ].join(' '),
  variants: {
    checked: {
      true: 'translate-x-[1.3rem]',
      false: '',
    },
  },
  defaultVariants: { checked: false },
});

export type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & {
  readonly checked: boolean;
  readonly onCheckedChange?: (checked: boolean) => void;
};

/**
 * CMP-0008 Switch — button role=switch.
 * D27: Switch = binary on/off toggle only. Use Checkbox for independent
 * multi-selection; Radio for mutually exclusive choice among 2–5 options.
 */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, className, disabled, ...rest }, ref) => (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={switchTrack({ checked, className })}
      onClick={() => onCheckedChange?.(!checked)}
      {...rest}
    >
      <span className={switchKnob({ checked })} aria-hidden="true" />
    </button>
  ),
);
Switch.displayName = 'Switch';
