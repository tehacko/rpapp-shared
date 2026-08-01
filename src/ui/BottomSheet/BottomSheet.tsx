import { useEffect, useId, useRef, type ReactNode } from 'react';
import {
  focusInitialInContainer,
  handleFocusTrapKeyDown,
  lockBodyScroll,
  setBackgroundInert,
} from '../overlay/overlayFocus.js';
import {
  OVERLAY_BACKDROP_ENTERED,
  OVERLAY_BACKDROP_EXITED,
  OVERLAY_MOTION_ENTERED,
  OVERLAY_MOTION_EXITED,
  OVERLAY_MOTION_TRANSITION,
  useOverlayPresence,
} from '../overlay/overlayMotion.js';

/**
 * CMP-0017 BottomSheet — Drawer alias (Radix-free sheet from bottom).
 * Wave A harden: focus trap, restore, busy Escape/backdrop, scroll lock, labelledby, inert.
 * Short enter/exit via motion tokens + motion-reduce; dvh + safe-area shell.
 */
export interface BottomSheetProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title?: string;
  readonly children: ReactNode;
  readonly closeLabel?: string;
  readonly className?: string;
  readonly testId?: string;
  /** When true, Escape and backdrop dismiss are no-ops; close control is disabled. */
  readonly busy?: boolean;
  /** Alias of busy. */
  readonly pending?: boolean;
  /** When false, backdrop click does not dismiss (default true). */
  readonly closeOnOverlayClick?: boolean;
  readonly describedBy?: string;
  readonly hideHeader?: boolean;
  readonly titleId?: string;
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  closeLabel = 'Close',
  className,
  testId = 'bottom-sheet',
  busy = false,
  pending = false,
  closeOnOverlayClick = true,
  describedBy,
  hideHeader = false,
  titleId: titleIdProp,
}: BottomSheetProps): JSX.Element | null {
  const isBusy = busy || pending;
  const generatedId = useId();
  const titleId = titleIdProp ?? `${generatedId}-title`;
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const { mounted, visible } = useOverlayPresence(open);

  // Initial focus when opening; capture restore target before moving focus in.
  useEffect(() => {
    if (!open || !mounted) {
      return;
    }
    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const panel = panelRef.current;
    if (panel !== null) {
      focusInitialInContainer(panel);
    }
  }, [open, mounted]);

  // Inert + scroll lock for full mounted lifetime (including exit fade); restore focus on unmount.
  useEffect(() => {
    if (!mounted) {
      return;
    }
    const unlock = lockBodyScroll();
    const root = rootRef.current;
    const clearInert = root !== null ? setBackgroundInert(root) : (): void => undefined;
    return (): void => {
      clearInert();
      unlock();
      const restore = restoreFocusRef.current;
      if (restore !== null && typeof restore.focus === 'function') {
        restore.focus();
      }
    };
  }, [mounted]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent): void => {
      const panel = panelRef.current;
      if (panel !== null) {
        handleFocusTrapKeyDown(panel, event);
      }
      if (event.key === 'Escape') {
        if (isBusy) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, onClose, isBusy]);

  if (!mounted) {
    return null;
  }

  const showHeader = Boolean(title) && !hideHeader;
  const labelledBy = title ? titleId : undefined;
  const motionState = visible ? OVERLAY_MOTION_ENTERED : OVERLAY_MOTION_EXITED;
  const backdropState = visible ? OVERLAY_BACKDROP_ENTERED : OVERLAY_BACKDROP_EXITED;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-50 flex h-[100dvh] max-h-[100dvh] items-end justify-center"
      data-testid={testId}
    >
      <button
        type="button"
        className={[
          'absolute inset-0 bg-black/40',
          OVERLAY_MOTION_TRANSITION,
          backdropState,
        ].join(' ')}
        aria-label={closeLabel}
        tabIndex={-1}
        disabled={isBusy || !closeOnOverlayClick || !open}
        onClick={() => {
          if (open && !isBusy && closeOnOverlayClick) {
            onClose();
          }
        }}
        data-testid={`${testId}-overlay`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        aria-busy={isBusy || undefined}
        className={[
          'relative z-10 max-h-[85dvh] w-full overflow-auto rounded-t-2xl border border-[var(--color-border)]',
          'bg-[var(--color-surface,var(--color-an-surface))] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lg',
          OVERLAY_MOTION_TRANSITION,
          motionState,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        data-testid={`${testId}-content`}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--color-border)]" aria-hidden="true" />
        {showHeader ? (
          <header className="mb-3 flex items-start justify-between gap-2">
            <h2 id={titleId} className="m-0 pt-1 text-base font-semibold leading-tight">
              {title}
            </h2>
            <button
              type="button"
              aria-label={closeLabel}
              onClick={onClose}
              disabled={isBusy || !open}
              data-testid={`${testId}-close`}
              className={[
                'inline-flex h-12 min-h-12 w-12 min-w-12 shrink-0 items-center justify-center self-start',
                '-mt-1 rounded-full border border-[var(--color-border)] text-3xl leading-none',
                'text-[var(--color-on-surface-muted)]',
                'hover:bg-[var(--color-surface-hover,var(--color-surface-elevated))] hover:text-[var(--color-on-surface)]',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring,var(--color-accent))]',
                'disabled:cursor-not-allowed disabled:opacity-50',
              ].join(' ')}
            >
              ×
            </button>
          </header>
        ) : title ? (
          <span id={titleId} className="sr-only">
            {title}
          </span>
        ) : null}
        {children}
      </div>
    </div>
  );
}

/** Drawer = BottomSheet alias only (registry). */
export const Drawer = BottomSheet;
export type DrawerProps = BottomSheetProps;
