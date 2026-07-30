/**
 * DECISION-2 C-Hybrid theme contract — system default + user override.
 *
 * Persists `light` | `dark` | `system` in per-app `localStorage` keys.
 * Effective palette is applied via the `.dark` / `.light` class on `<html>`.
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

function readStoredPreference(
  storageKey: string,
  defaultPreference: ThemePreference,
): ThemePreference {
  if (typeof window === 'undefined') {
    return defaultPreference;
  }
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw === 'light' || raw === 'dark' || raw === 'system') {
      return raw;
    }
  } catch {
    /* ignore quota / privacy errors */
  }
  return defaultPreference;
}

export interface ThemeApplyOptions {
  /** When true, explicit `light` preference adds `.light` to override system dark media. */
  readonly lightOverrideEnabled?: boolean;
  /**
   * Preference when `localStorage` is empty.
   * Admin uses `light` so dark is only on after an explicit toggle.
   * Default: `system` (follow OS).
   */
  readonly defaultPreference?: ThemePreference;
  /**
   * When preference is `system`, resolve to this instead of OS.
   * Use `light` with admin so legacy `system` values do not auto-dark.
   */
  readonly systemResolvesTo?: EffectiveTheme;
}

function applyThemeClasses(
  preference: ThemePreference,
  effective: EffectiveTheme,
  options?: ThemeApplyOptions,
): void {
  if (typeof document === 'undefined') {
    return;
  }
  const root = document.documentElement;
  const lightOverrideEnabled = options?.lightOverrideEnabled === true;
  root.classList.remove('dark', 'light');

  if (lightOverrideEnabled && preference === 'light') {
    root.classList.add('light');
    return;
  }

  if (lightOverrideEnabled && preference === 'system' && options?.systemResolvesTo === 'light') {
    root.classList.add('light');
    return;
  }

  if (preference === 'dark' || effective === 'dark') {
    root.classList.add('dark');
  }
}

/**
 * Imperative theme controller for a single app surface.
 * Call `applyInitialTheme()` before the first React paint to avoid flash.
 */
export function createThemeApi(
  storageKey: string,
  options?: ThemeApplyOptions,
): ThemeApi {
  const defaultPreference: ThemePreference = options?.defaultPreference ?? 'system';

  const getThemePreference = (): ThemePreference =>
    readStoredPreference(storageKey, defaultPreference);

  const getEffectiveTheme = (): EffectiveTheme => {
    const pref = getThemePreference();
    if (pref === 'system') {
      return options?.systemResolvesTo ?? resolveSystemTheme();
    }
    return pref;
  };

  const syncDomClasses = (): void => {
    applyThemeClasses(getThemePreference(), getEffectiveTheme(), options);
  };

  const applyInitialTheme = (): void => {
    syncDomClasses();
  };

  const setTheme = (pref: ThemePreference): void => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, pref);
      }
    } catch {
      /* ignore */
    }
    syncDomClasses();
  };

  const subscribeToSystemTheme = (onChange?: () => void): (() => void) => {
    if (typeof window === 'undefined') {
      return () => undefined;
    }
    if (options?.systemResolvesTo != null) {
      /* OS changes ignored — preference does not follow system */
      return () => undefined;
    }
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) {
      return () => undefined;
    }
    const listener = (): void => {
      if (getThemePreference() === 'system') {
        syncDomClasses();
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
