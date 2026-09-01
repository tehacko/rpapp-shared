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
  /**
   * `flush` removes default panel padding so media can bleed edge-to-edge.
   * Safe-area bottom inset is still applied on the panel.
   */
  readonly contentPadding?: 'default' | 'flush';
  /**
   * `flex` — column flex + overflow hidden (child owns scroll regions).
   * Default `scroll` keeps legacy overflow-auto on the panel.
   */
  readonly panelLayout?: 'scroll' | 'flex';
  /** Extra classes for the fixed outer container (e.g. `lg:items-center`). */
  readonly containerClassName?: string;
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
  contentPadding = 'default',
  panelLayout = 'scroll',
  containerClassName,
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
  const isFlush = contentPadding === 'flush';
  const paddingClass = isFlush
    ? 'p-0 pb-[max(0px,env(safe-area-inset-bottom,0px))]'
    : 'p-4 pb-[max(1rem,env(safe-area-inset-bottom))]';
  const scrollLayoutClass =
    panelLayout === 'flex' ? 'flex flex-col overflow-hidden' : 'overflow-auto';

  return (
    <div
      ref={rootRef}
      // Clear `--customer-bottom-chrome` (BottomNav) so the sheet + backdrop sit
      // above tab chrome — same offset token as StickyCart / Toast / cookie banner.
      // Defaults to 0px when the token is unset (kiosk / non-customer hosts).
      className={`fixed inset-x-0 top-0 bottom-[var(--customer-bottom-chrome,0px)] z-50 flex items-end justify-center${containerClassName ? ` ${containerClassName}` : ''}`}
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
          'relative z-10 max-h-[85dvh] w-full rounded-t-2xl border border-[var(--color-border)]',
          'bg-[var(--color-surface,var(--color-an-surface))] shadow-lg',
          paddingClass,
          scrollLayoutClass,
          OVERLAY_MOTION_TRANSITION,
          motionState,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        data-testid={`${testId}-content`}
        data-content-padding={contentPadding}
        data-panel-layout={panelLayout}
      >
        <div
          className={[
            'mx-auto h-1 w-10 shrink-0 rounded-full bg-[var(--color-border)]',
            isFlush ? 'mb-2 mt-3' : 'mb-3',
          ].join(' ')}
          aria-hidden="true"
        />
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
                '-mt-1 rounded-full border border-[var(--color-border)]',
                'text-[var(--color-on-surface-muted)]',
                'hover:bg-[var(--color-surface-hover,var(--color-surface-elevated))] hover:text-[var(--color-on-surface)]',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring,var(--color-accent))]',
                'disabled:cursor-not-allowed disabled:opacity-50',
              ].join(' ')}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
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
