import type { HTMLAttributes } from 'react';

export type ToastVariant = 'default' | 'success' | 'warn' | 'danger' | 'info';

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  readonly message: string;
  readonly variant?: ToastVariant;
  readonly onDismiss?: () => void;
  readonly dismissLabel?: string;
  readonly testId?: string;
}

const VARIANT_CLASS: Record<ToastVariant, string> = {
  default: 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-on-surface)]',
  success:
    'border-[var(--color-success,var(--color-an-success))] bg-[color-mix(in_oklab,var(--color-success,var(--color-an-success))_12%,transparent)] text-[var(--color-success,var(--color-an-success))]',
  warn: 'border-[var(--color-warning,var(--color-an-warn))] bg-[color-mix(in_oklab,var(--color-warning,var(--color-an-warn))_12%,transparent)] text-[var(--color-warning,var(--color-an-warn))]',
  danger:
    'border-[var(--color-danger,var(--color-an-danger))] bg-[color-mix(in_oklab,var(--color-danger,var(--color-an-danger))_12%,transparent)] text-[var(--color-danger,var(--color-an-danger))]',
  info: 'border-[var(--color-info,#0ea5e9)] bg-[color-mix(in_oklab,var(--color-info,#0ea5e9)_12%,transparent)] text-[var(--color-info,#0ea5e9)]',
};

/**
 * CMP-0011 Toast (= Snackbar) — presentational item; host owns queue/viewport.
 */
export function Toast({
  message,
  variant = 'default',
  onDismiss,
  dismissLabel = 'Dismiss',
  className,
  testId = 'toast',
  ...rest
}: ToastProps): JSX.Element {
  return (
    <div
      role="status"
      className={[
        'flex items-start gap-3 rounded-md border px-3 py-2 text-sm shadow-sm',
        VARIANT_CLASS[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      data-variant={variant}
      {...rest}
    >
      <p className="m-0 flex-1">{message}</p>
      {onDismiss ? (
        <button
          type="button"
          className="shrink-0 text-xs font-semibold underline"
          aria-label={dismissLabel}
          onClick={onDismiss}
          data-testid={`${testId}-dismiss`}
        >
          {dismissLabel}
        </button>
      ) : null}
    </div>
  );
}
