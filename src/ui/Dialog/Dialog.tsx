import {
  useEffect,
  useId,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
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

const MODAL_DIALOG_SELECTOR =
  '[role="dialog"][aria-modal="true"], [role="alertdialog"][aria-modal="true"]';

/** True when `panel` is the last (topmost) modal dialog/alertdialog in document order. */
function isTopmostModalDialog(panel: HTMLElement): boolean {
  const dialogs = document.querySelectorAll(MODAL_DIALOG_SELECTOR);
  return dialogs.length > 0 && dialogs[dialogs.length - 1] === panel;
}

/**
 * CMP-0010 Dialog — Radix-free modal shell.
 * Portals to `document.body` so `fixed inset-0` is not clipped by ancestors with
 * `container-type` / transform / filter (e.g. Card `rp-card-container`).
 * Wave A harden: focus trap, restore, busy Escape/backdrop, scroll lock, labelledby, inert.
 * Short enter/exit via motion tokens; Confirm inherits this surface.
 */
export interface DialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title?: string;
  readonly children: ReactNode;
  readonly closeOnOverlayClick?: boolean;
  readonly closeLabel?: string;
  readonly className?: string;
  /** Optional class for the fixed full-viewport shell (backdrop + panel host). */
  readonly shellClassName?: string;
  /**
   * Additive props for the role=dialog|alertdialog panel only (e.g. data-scan-mode).
   * Never use panelAttrs — panelProps is the sole escape hatch.
   */
  readonly panelProps?: Omit<
    HTMLAttributes<HTMLDivElement>,
    'role' | 'children' | 'aria-modal'
  > & {
    readonly 'data-scan-mode'?: string;
  };
  readonly testId?: string;
  /** When true, Escape and backdrop dismiss are no-ops; close control is disabled. */
  readonly busy?: boolean;
  /** Alias of busy (ConfirmDialog / pending flows). */
  readonly pending?: boolean;
  /** Optional description id for aria-describedby. */
  readonly describedBy?: string;
  /** role="alertdialog" for destructive confirms. */
  readonly role?: 'dialog' | 'alertdialog';
  /** Hide the built-in title row (caller supplies labelled chrome). */
  readonly hideHeader?: boolean;
  /** Stable id for title element; auto-generated when omitted. */
  readonly titleId?: string;
}

const DIALOG_SHELL_PAD =
  'pt-[max(1rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))]';

export function Dialog({
  open,
  onClose,
  title,
  children,
  closeOnOverlayClick = true,
  closeLabel = 'Close',
  className,
  shellClassName,
  panelProps,
  testId = 'dialog',
  busy = false,
  pending = false,
  describedBy,
  role = 'dialog',
  hideHeader = false,
  titleId: titleIdProp,
}: DialogProps): JSX.Element | null {
  const isBusy = busy || pending;
  const generatedId = useId();
  const titleId = titleIdProp ?? `${generatedId}-title`;
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const { mounted, visible } = useOverlayPresence(open);
  const {
    className: panelPropsClassName,
    ...restPanelProps
  } = panelProps ?? {};

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
      if (panel === null) {
        return;
      }
      if (!isTopmostModalDialog(panel)) {
        return;
      }
      handleFocusTrapKeyDown(panel, event);
      if (event.key === 'Escape') {
        if (isBusy) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, onClose, isBusy]);

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  const showHeader = Boolean(title) && !hideHeader;
  const labelledBy = title ? titleId : undefined;
  const motionState = visible ? OVERLAY_MOTION_ENTERED : OVERLAY_MOTION_EXITED;
  const backdropState = visible ? OVERLAY_BACKDROP_ENTERED : OVERLAY_BACKDROP_EXITED;

  return createPortal(
    <div
      ref={rootRef}
      className={[
        'fixed inset-0 z-[var(--z-dialog,50)] flex h-[100dvh] items-center justify-center',
        DIALOG_SHELL_PAD,
        shellClassName,
      ]
        .filter(Boolean)
        .join(' ')}
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
        data-testid={`${testId}-overlay`}
        tabIndex={-1}
        disabled={isBusy || !closeOnOverlayClick || !open}
        onClick={() => {
          if (open && !isBusy && closeOnOverlayClick) {
            onClose();
          }
        }}
      />
      <div
        {...restPanelProps}
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        aria-busy={isBusy || undefined}
        className={[
          'relative z-10 w-full max-w-lg rounded-lg border border-[var(--color-border,var(--color-an-border))]',
          'bg-[var(--color-surface,var(--color-an-surface))] p-4 shadow-lg',
          OVERLAY_MOTION_TRANSITION,
          motionState,
          panelPropsClassName,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        data-testid={`${testId}-content`}
      >
        {showHeader ? (
          <header className="mb-3 flex items-start justify-between gap-3">
            <h2
              id={titleId}
              className="m-0 text-lg font-semibold text-[var(--color-on-surface,var(--color-an-text))]"
            >
              {title}
            </h2>
            <button
              type="button"
              className="rounded-md px-2 py-1 text-sm text-[var(--color-on-surface-muted)]"
              aria-label={closeLabel}
              onClick={onClose}
              disabled={isBusy || !open}
              data-testid={`${testId}-close`}
            >
              ×
            </button>
          </header>
        ) : title ? (
          <span id={titleId} className="sr-only">
            {title}
          </span>
        ) : null}
        <div>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
