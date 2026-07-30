import type { ReactNode } from 'react';

/**
 * CMP-0015 ScreenState — Q12 union (ADR-FE-UI-001 v4).
 * Presentational only — callers own i18n copy.
 */
export type ScreenStateVariant = 'loading' | 'error' | 'empty' | 'offline' | 'success';

export interface ScreenStateAction {
  readonly label: string;
  readonly onClick: () => void;
}

export interface ScreenStateProps {
  readonly variant: ScreenStateVariant;
  readonly title?: string;
  readonly message?: string;
  readonly hint?: string;
  readonly icon?: ReactNode;
  readonly error?: Error;
  readonly onRetry?: () => void;
  readonly retryLabel?: string;
  readonly action?: ScreenStateAction;
  readonly testId?: string;
  readonly className?: string;
  /** Optional custom body (e.g. app skeleton / spinner). */
  readonly children?: ReactNode;
}

function panelClass(variant: ScreenStateVariant): string {
  if (variant === 'error' || variant === 'offline') {
    return [
      'rounded-lg border border-[var(--color-danger,var(--color-an-danger,#dc2626))]',
      'bg-[color-mix(in_oklab,var(--color-danger,var(--color-an-danger,#dc2626))_10%,transparent)]',
      'p-4 text-center',
    ].join(' ');
  }
  if (variant === 'success') {
    return [
      'rounded-lg border border-[color-mix(in_oklab,var(--color-success,var(--color-an-success,#16a34a))_55%,transparent)]',
      'bg-[color-mix(in_oklab,var(--color-success,var(--color-an-success,#16a34a))_12%,transparent)]',
      'p-4 text-[var(--color-success,var(--color-an-success,#16a34a))]',
    ].join(' ');
  }
  return [
    'rounded-lg border border-[var(--color-border,var(--color-an-border,#e5e7eb))]',
    'bg-[var(--color-surface,var(--color-an-surface,#fff))]',
    'p-4 text-center',
  ].join(' ');
}

export function ScreenState({
  variant,
  title,
  message,
  hint,
  icon,
  error,
  onRetry,
  retryLabel = 'Retry',
  action,
  testId,
  className,
  children,
}: ScreenStateProps): JSX.Element {
  const resolvedMessage = error?.message ?? message;
  const role = variant === 'error' || variant === 'offline' ? 'alert' : 'status';
  const live = variant === 'loading' ? 'polite' : undefined;

  return (
    <div
      className={[panelClass(variant), className].filter(Boolean).join(' ')}
      role={role}
      aria-live={live}
      aria-busy={variant === 'loading' ? true : undefined}
      data-testid={testId ?? `screen-state-${variant}`}
      data-variant={variant}
    >
      {icon ? <div className="mb-2 flex justify-center text-2xl" aria-hidden="true">{icon}</div> : null}
      {title ? (
        <h3 className="m-0 text-base font-semibold text-[var(--color-on-surface,var(--color-an-text,#111))]">
          {title}
        </h3>
      ) : null}
      {resolvedMessage ? (
        <p className="mt-1 mb-0 text-sm text-[var(--color-on-surface-muted,var(--color-an-text-muted,#6b7280))]">
          {resolvedMessage}
        </p>
      ) : null}
      {hint ? (
        <p className="mt-1 mb-0 text-xs text-[var(--color-on-surface-muted,var(--color-an-text-muted,#6b7280))]">
          {hint}
        </p>
      ) : null}
      {children}
      {onRetry ? (
        <div className="mt-3">
          <button
            type="button"
            className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[var(--color-action-primary,var(--color-an-primary,#18181b))] px-4 py-2 text-sm font-semibold text-[var(--color-an-on-primary,#ffffff)]"
            onClick={onRetry}
            data-testid={`${testId ?? 'screen-state'}-retry`}
          >
            {retryLabel}
          </button>
        </div>
      ) : null}
      {action ? (
        <div className="mt-3">
          <button
            type="button"
            className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[var(--color-border,var(--color-an-border))] px-4 py-2 text-sm font-semibold"
            onClick={action.onClick}
            data-testid={`${testId ?? 'screen-state'}-action`}
          >
            {action.label}
          </button>
        </div>
      ) : null}
    </div>
  );
}
