import { Minus, Plus } from '../Icon/lucide.js';
import { IconButton, type IconButtonProps } from '../IconButton/IconButton.js';

export interface QuantityStepperProps {
  readonly value: number;
  readonly onInc: () => void;
  readonly onDec: () => void;
  readonly min?: number;
  readonly max?: number;
  /** When true, both controls are disabled (e.g. line not selected). */
  readonly disabled?: boolean;
  /** Accessible name for the stepper group (buttons get derived labels). */
  readonly 'aria-label': string;
  /** Override decrease control accessible name (defaults to `${aria-label}: decrease`). */
  readonly decreaseAriaLabel?: string;
  /** Override increase control accessible name (defaults to `${aria-label}: increase`). */
  readonly increaseAriaLabel?: string;
  /**
   * Control hit target. Prefer `md` (≥44) on kiosk / Spec touch surfaces.
   * @default 'md'
   */
  readonly size?: NonNullable<IconButtonProps['size']>;
  readonly className?: string;
  readonly testId?: string;
}

/**
 * CMP-0016 QuantityStepper — thin +/- quantity control.
 * Prefer this over one-off IconButtons for cart/line qty.
 */
export function QuantityStepper({
  value,
  onInc,
  onDec,
  min = 0,
  max,
  disabled = false,
  'aria-label': ariaLabel,
  decreaseAriaLabel,
  increaseAriaLabel,
  size = 'md',
  className,
  testId = 'quantity-stepper',
}: QuantityStepperProps): JSX.Element {
  const atMin = value <= min;
  const atMax = max !== undefined && value >= max;
  const decLabel = decreaseAriaLabel ?? `${ariaLabel}: decrease`;
  const incLabel = increaseAriaLabel ?? `${ariaLabel}: increase`;

  return (
    <div
      className={['inline-flex items-center gap-2', className].filter(Boolean).join(' ')}
      role="group"
      aria-label={ariaLabel}
      data-testid={testId}
    >
      <IconButton
        icon={Minus}
        size={size}
        tone="muted"
        aria-label={decLabel}
        disabled={disabled || atMin}
        onClick={onDec}
        data-testid={`${testId}-dec`}
      />
      <span
        className="min-w-8 text-center text-base font-semibold tabular-nums text-[var(--color-text-primary,var(--color-on-surface))]"
        aria-live="polite"
        data-testid={`${testId}-value`}
      >
        {value}
      </span>
      <IconButton
        icon={Plus}
        size={size}
        aria-label={incLabel}
        disabled={disabled || atMax}
        onClick={onInc}
        data-testid={`${testId}-inc`}
      />
    </div>
  );
}
