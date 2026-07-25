import { useEffect, type ReactNode } from 'react';

/**
 * CMP-0017 BottomSheet — Drawer alias (Radix-free sheet from bottom).
 */
export interface BottomSheetProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title?: string;
  readonly children: ReactNode;
  readonly closeLabel?: string;
  readonly className?: string;
  readonly testId?: string;
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  closeLabel = 'Close',
  className,
  testId = 'bottom-sheet',
}: BottomSheetProps): JSX.Element | null {
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
    <div className="fixed inset-0 z-50 flex items-end justify-center" data-testid={testId}>
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={closeLabel}
        onClick={onClose}
        data-testid={`${testId}-overlay`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={[
          'relative z-10 max-h-[85vh] w-full overflow-auto rounded-t-2xl border border-[var(--color-border)]',
          'bg-[var(--color-surface,var(--color-an-surface))] p-4 shadow-lg',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        data-testid={`${testId}-content`}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--color-border)]" aria-hidden="true" />
        {title ? (
          <header className="mb-3 flex items-center justify-between gap-2">
            <h2 className="m-0 text-base font-semibold">{title}</h2>
            <button type="button" aria-label={closeLabel} onClick={onClose} data-testid={`${testId}-close`}>
              ×
            </button>
          </header>
        ) : null}
        {children}
      </div>
    </div>
  );
}

/** Drawer = BottomSheet alias only (registry). */
export const Drawer = BottomSheet;
export type DrawerProps = BottomSheetProps;
