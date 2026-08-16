import type { HTMLAttributes } from 'react';
import {
  OVERLAY_MOTION_ENTERED,
  OVERLAY_MOTION_EXITED,
  OVERLAY_MOTION_TRANSITION,
  useOverlayPresence,
} from '../overlay/overlayMotion.js';

export type ToastVariant = 'default' | 'success' | 'warn' | 'danger' | 'info';

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  readonly message: string;
  readonly variant?: ToastVariant;
  readonly onDismiss?: () => void;
  readonly dismissLabel?: string;
  readonly testId?: string;
  /**
   * Controlled presence (default true). When false, applies EXITED motion classes;
   * keep the node mounted until the parent removes it after `OVERLAY_EXIT_MS`.
   */
  readonly open?: boolean;
  /** Force EXITED motion state (host-owned exit hold; alternative to `open={false}`). */
  readonly exiting?: boolean;
}

const VARIANT_CLASS: Record<ToastVariant, string> = {
  default: 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-on-surface)]',
  // Mix tint into opaque surface (not transparent) so page text never bleeds through.
  success:
    'border-[var(--color-success,var(--color-an-success))] bg-[color-mix(in_oklab,var(--color-success,var(--color-an-success))_12%,var(--color-surface-elevated,var(--color-surface)))] text-[var(--color-success,var(--color-an-success))]',
  warn: 'border-[var(--color-warning,var(--color-an-warn))] bg-[color-mix(in_oklab,var(--color-warning,var(--color-an-warn))_12%,var(--color-surface-elevated,var(--color-surface)))] text-[var(--color-warning,var(--color-an-warn))]',
  danger:
    'border-[var(--color-danger,var(--color-an-danger))] bg-[color-mix(in_oklab,var(--color-danger,var(--color-an-danger))_12%,var(--color-surface-elevated,var(--color-surface)))] text-[var(--color-danger,var(--color-an-danger))]',
  info: 'border-[var(--color-info,#0ea5e9)] bg-[color-mix(in_oklab,var(--color-info,#0ea5e9)_12%,var(--color-surface-elevated,var(--color-surface)))] text-[var(--color-info,#0ea5e9)]',
};

function toastAriaLive(variant: ToastVariant): 'polite' | 'assertive' {
  return variant === 'danger' || variant === 'warn' ? 'assertive' : 'polite';
}

/**
 * CMP-0011 Toast (= Snackbar) — presentational item; host owns queue/viewport.
 * Live region: polite for success/info/default; assertive for danger/warn.
 * Short enter/exit via motion tokens; motion-reduce disables transition.
 * Toast does not self-unmount on exit — parent removes after `OVERLAY_EXIT_MS`.
 */
export function Toast({
  message,
  variant = 'default',
  onDismiss,
  dismissLabel = 'Dismiss',
  className,
  testId = 'toast',
  open = true,
  exiting = false,
  ...rest
}: ToastProps): JSX.Element {
  const ariaLive = toastAriaLive(variant);
  const { visible } = useOverlayPresence(open && !exiting);
  const motionState =
    exiting || !visible ? OVERLAY_MOTION_EXITED : OVERLAY_MOTION_ENTERED;
  return (
    <div
      role={ariaLive === 'assertive' ? 'alert' : 'status'}
      aria-live={ariaLive}
      aria-atomic="true"
      className={[
        'flex min-w-0 max-w-full items-start gap-3 overflow-hidden rounded-md border px-3 py-2 text-sm shadow-sm',
        VARIANT_CLASS[variant],
        OVERLAY_MOTION_TRANSITION,
        motionState,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      data-variant={variant}
      {...rest}
    >
      <p className="m-0 min-w-0 flex-1 break-words">{message}</p>
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
