/**
 * Shared overlay focus helpers for Dialog / BottomSheet (Wave A harden).
 * Trap Tab within container; restore focus on close; optional body scroll lock.
 */

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function listFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.hasAttribute('disabled') && element.tabIndex !== -1,
  );
}

/** Tab / Shift+Tab cycle within a dialog container. */
export function handleFocusTrapKeyDown(container: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== 'Tab') {
    return;
  }
  const focusables = listFocusable(container);
  if (focusables.length === 0) {
    return;
  }
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (first === undefined || last === undefined) {
    return;
  }
  const active = document.activeElement;
  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
    return;
  }
  if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

/**
 * Focus the preferred control when open, else `[data-initial-focus]`, else first focusable.
 * Prefer marking the primary/confirm action with `data-initial-focus` so Cancel can stay
 * first in visual/DOM order (e.g. left on sm+) without stealing initial focus.
 */
export function focusInitialInContainer(
  container: HTMLElement,
  preferred?: HTMLElement | null,
): void {
  const focusables = listFocusable(container);

  if (preferred != null && focusables.includes(preferred)) {
    preferred.focus();
    return;
  }

  const marked = container.querySelector<HTMLElement>('[data-initial-focus]');
  if (marked !== null && focusables.includes(marked)) {
    marked.focus();
    return;
  }

  const first = focusables[0];
  if (first !== undefined) {
    first.focus();
    return;
  }
  if (!container.hasAttribute('tabindex')) {
    container.tabIndex = -1;
  }
  container.focus();
}

let scrollLockCount = 0;
let previousHtmlOverflow: string | null = null;
let previousBodyOverflow: string | null = null;
let previousHtmlOverscroll: string | null = null;
let previousBodyOverscroll: string | null = null;

/**
 * Nested-safe document scroll lock while any overlay is open.
 * On first lock (0→1): saves html+body overflow and overscrollBehavior, then
 * sets overflow=hidden and overscrollBehavior=none on both (AdminLoginShell pattern).
 * On unlock when count→0: restores previous values.
 */
export function lockBodyScroll(): () => void {
  if (typeof document === 'undefined') {
    return () => undefined;
  }
  if (scrollLockCount === 0) {
    const html = document.documentElement;
    const { body } = document;
    previousHtmlOverflow = html.style.overflow;
    previousBodyOverflow = body.style.overflow;
    previousHtmlOverscroll = html.style.overscrollBehavior;
    previousBodyOverscroll = body.style.overscrollBehavior;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';
    body.style.overscrollBehavior = 'none';
  }
  scrollLockCount += 1;
  return (): void => {
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0 && previousBodyOverflow !== null) {
      const html = document.documentElement;
      const { body } = document;
      html.style.overflow = previousHtmlOverflow ?? '';
      body.style.overflow = previousBodyOverflow;
      html.style.overscrollBehavior = previousHtmlOverscroll ?? '';
      body.style.overscrollBehavior = previousBodyOverscroll ?? '';
      previousHtmlOverflow = null;
      previousBodyOverflow = null;
      previousHtmlOverscroll = null;
      previousBodyOverscroll = null;
    }
  };
}

/**
 * Mark page/backdrop siblings `inert` while an overlay is mounted.
 * Walks from `document.body`, leaves the keepAlive subtree interactive,
 * and inerts every node that is not keepAlive or an ancestor of it.
 * Callers (Dialog / BottomSheet) should hold the returned cleanup for the full
 * `useOverlayPresence` mounted lifetime — including exit fade — not clear when
 * `open` flips false.
 * Returns a cleanup that clears only the inert flags this call applied.
 */
export function setBackgroundInert(keepAlive: HTMLElement): () => void {
  if (typeof document === 'undefined' || document.body === null) {
    return () => undefined;
  }

  const applied: HTMLElement[] = [];

  const visit = (parent: HTMLElement): void => {
    for (const child of Array.from(parent.children)) {
      if (!(child instanceof HTMLElement)) {
        continue;
      }
      if (child === keepAlive) {
        continue;
      }
      if (child.contains(keepAlive)) {
        visit(child);
        continue;
      }
      if (child.hasAttribute('inert')) {
        continue;
      }
      child.setAttribute('inert', '');
      // Reflect IDL when the environment supports it (jsdom may omit).
      child.inert = true;
      applied.push(child);
    }
  };

  visit(document.body);

  return (): void => {
    for (const element of applied) {
      element.removeAttribute('inert');
      element.inert = false;
    }
  };
}
