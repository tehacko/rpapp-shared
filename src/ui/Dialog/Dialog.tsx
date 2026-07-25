import { useEffect, type ReactNode } from 'react';

/**
 * CMP-0010 Dialog — Radix-free modal shell (no portal library).
 */
export interface DialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title?: string;
  readonly children: ReactNode;
  readonly closeOnOverlayClick?: boolean;
  readonly closeLabel?: string;
  readonly className?: string;
  readonly testId?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  closeOnOverlayClick = true,
  closeLabel = 'Close',
  className,
  testId = 'dialog',
}: DialogProps): JSX.Element | null {
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid={testId}>
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={closeLabel}
        data-testid={`${testId}-overlay`}
        onClick={() => {
          if (closeOnOverlayClick) {
            onClose();
          }
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={[
          'relative z-10 w-full max-w-lg rounded-lg border border-[var(--color-border,var(--color-an-border))]',
          'bg-[var(--color-surface,var(--color-an-surface))] p-4 shadow-lg',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        data-testid={`${testId}-content`}
      >
        {title ? (
          <header className="mb-3 flex items-start justify-between gap-3">
            <h2 className="m-0 text-lg font-semibold text-[var(--color-on-surface,var(--color-an-text))]">
              {title}
            </h2>
            <button
              type="button"
              className="rounded-md px-2 py-1 text-sm text-[var(--color-on-surface-muted)]"
              aria-label={closeLabel}
              onClick={onClose}
              data-testid={`${testId}-close`}
            >
              ×
            </button>
          </header>
        ) : null}
        <div>{children}</div>
      </div>
    </div>
  );
}
