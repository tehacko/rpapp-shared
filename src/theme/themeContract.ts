/**
 * DECISION-2 C-Hybrid theme contract — system default + user override.
 *
 * Persists `light` | `dark` | `system` in per-app `localStorage` keys.
 * Effective palette is applied via the `.dark` class on `<html>`.
 */

export type ThemePreference = 'light' | 'dark' | 'system';

export type EffectiveTheme = 'light' | 'dark';

/** Per-app `localStorage` keys (isolated so toggles do not leak across surfaces). */
export const THEME_STORAGE_KEYS = {
  admin: 'rpapp-admin-theme',
  customer: 'rpapp-customer-theme',
  kiosk: 'rpapp-kiosk-theme',
  pickup: 'rpapp-pickup-theme',
} as const;

export type ThemeAppId = keyof typeof THEME_STORAGE_KEYS;

export interface ThemeApi {
  applyInitialTheme: () => void;
  setTheme: (pref: ThemePreference) => void;
  getThemePreference: () => ThemePreference;
  getEffectiveTheme: () => EffectiveTheme;
  /** Re-sync when OS preference changes while preference is `system`. */
  subscribeToSystemTheme: (onChange?: () => void) => () => void;
}

function resolveSystemTheme(): EffectiveTheme {
  if (typeof window === 'undefined') {
    return 'light';
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function readStoredPreference(storageKey: string): ThemePreference {
  if (typeof window === 'undefined') {
    return 'system';
  }
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw === 'light' || raw === 'dark' || raw === 'system') {
      return raw;
    }
  } catch {
    /* ignore quota / privacy errors */
  }
  return 'system';
}

function applyClass(theme: EffectiveTheme): void {
  if (typeof document === 'undefined') {
    return;
  }
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/**
 * Imperative theme controller for a single app surface.
 * Call `applyInitialTheme()` before the first React paint to avoid flash.
 */
export function createThemeApi(storageKey: string): ThemeApi {
  const getThemePreference = (): ThemePreference => readStoredPreference(storageKey);

  const getEffectiveTheme = (): EffectiveTheme => {
    const pref = getThemePreference();
    if (pref === 'system') {
      return resolveSystemTheme();
    }
    return pref;
  };

  const applyInitialTheme = (): void => {
    applyClass(getEffectiveTheme());
  };

  const setTheme = (pref: ThemePreference): void => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, pref);
      }
    } catch {
      /* ignore */
    }
    applyClass(getEffectiveTheme());
  };

  const subscribeToSystemTheme = (onChange?: () => void): (() => void) => {
    if (typeof window === 'undefined') {
      return () => undefined;
    }
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) {
      return () => undefined;
    }
    const listener = (): void => {
      if (getThemePreference() === 'system') {
        applyClass(getEffectiveTheme());
        onChange?.();
      }
    };
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  };

  return {
    applyInitialTheme,
    setTheme,
    getThemePreference,
    getEffectiveTheme,
    subscribeToSystemTheme,
  };
}

/** Convenience for boot scripts that only need the initial `.dark` sync. */
export function applyInitialTheme(storageKey: string): void {
  createThemeApi(storageKey).applyInitialTheme();
}

/** Convenience for imperative toggles outside React. */
export function setTheme(storageKey: string, pref: ThemePreference): void {
  createThemeApi(storageKey).setTheme(pref);
}
