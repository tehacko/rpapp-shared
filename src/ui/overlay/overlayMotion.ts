import { useEffect, useState } from 'react';

/**
 * Short overlay enter/exit motion (Dialog / BottomSheet / Toast).
 * Tokens from shared theme.css; fallbacks match Spec defaults when unset.
 */
export const OVERLAY_MOTION_TRANSITION =
  'transition-[opacity,transform] duration-[var(--motion-duration-base,150ms)] ease-[var(--motion-easing-standard,ease)] motion-reduce:transition-none';

/** Settled (visible) panel/toast surface. */
export const OVERLAY_MOTION_ENTERED = 'opacity-100 translate-y-0 scale-100';

/** Pre-enter / exiting panel (brief opacity + transform). */
export const OVERLAY_MOTION_EXITED = 'opacity-0 translate-y-1 scale-[0.98]';

/** Backdrop fade only. */
export const OVERLAY_BACKDROP_ENTERED = 'opacity-100';
export const OVERLAY_BACKDROP_EXITED = 'opacity-0';

/** Exit delay covers --motion-duration-base (200ms in theme) + small buffer. */
export const OVERLAY_EXIT_MS = 220;

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export interface OverlayPresence {
  /** Keep in DOM while enter/exit runs. */
  readonly mounted: boolean;
  /** True after enter frame / false while exiting. */
  readonly visible: boolean;
}

/**
 * Mount-gated presence for controlled overlays (`open`).
 * Open mounts synchronously; exit holds DOM for OVERLAY_EXIT_MS (skipped when reduce).
 */
export function useOverlayPresence(open: boolean): OverlayPresence {
  const [held, setHeld] = useState(open);
  const [visible, setVisible] = useState(() => open && prefersReducedMotion());

  if (open && !held) {
    setHeld(true);
  }

  useEffect(() => {
    if (open) {
      if (prefersReducedMotion()) {
        setVisible(true);
        return;
      }
      setVisible(false);
      const id = requestAnimationFrame(() => {
        setVisible(true);
      });
      return (): void => {
        cancelAnimationFrame(id);
      };
    }

    setVisible(false);
    if (prefersReducedMotion()) {
      setHeld(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setHeld(false);
    }, OVERLAY_EXIT_MS);
    return (): void => {
      window.clearTimeout(timer);
    };
  }, [open]);

  return { mounted: open || held, visible };
}

/**
 * One-shot enter for presentational surfaces that mount when shown
 * (prefer `useOverlayPresence` when exit hold is needed, e.g. Toast `open`).
 */
export function useEnterMotion(): boolean {
  const [entered, setEntered] = useState(() => prefersReducedMotion());

  useEffect(() => {
    if (prefersReducedMotion()) {
      setEntered(true);
      return;
    }
    const id = requestAnimationFrame(() => {
      setEntered(true);
    });
    return (): void => {
      cancelAnimationFrame(id);
    };
  }, []);

  return entered;
}
