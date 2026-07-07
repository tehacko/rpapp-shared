import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createThemeApi,
  type EffectiveTheme,
  type ThemeApi,
  type ThemePreference,
} from './themeContract.js';

export type { EffectiveTheme, ThemeApi, ThemePreference };
export {
  THEME_STORAGE_KEYS,
  applyInitialTheme,
  createThemeApi,
  setTheme,
  type ThemeAppId,
} from './themeContract.js';

export interface ThemeContextValue {
  preference: ThemePreference;
  effectiveTheme: EffectiveTheme;
  setTheme: (pref: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  /** Per-app key from `THEME_STORAGE_KEYS` (e.g. `rpapp-customer-theme`). */
  storageKey: string;
  children: ReactNode;
}

/**
 * React bridge for DECISION-2 C-Hybrid dark mode.
 * Wrap the app (or subtree) and read/update theme via `useTheme()`.
 */
export function ThemeProvider({ storageKey, children }: ThemeProviderProps): JSX.Element {
  const api = useMemo(() => createThemeApi(storageKey), [storageKey]);
  const [preference, setPreference] = useState<ThemePreference>(() => api.getThemePreference());
  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>(() => api.getEffectiveTheme());

  const syncFromApi = useCallback((): void => {
    setPreference(api.getThemePreference());
    setEffectiveTheme(api.getEffectiveTheme());
  }, [api]);

  useEffect(() => {
    api.applyInitialTheme();
    syncFromApi();
    return api.subscribeToSystemTheme(syncFromApi);
  }, [api, syncFromApi]);

  const setThemePreference = useCallback(
    (pref: ThemePreference): void => {
      api.setTheme(pref);
      syncFromApi();
    },
    [api, syncFromApi],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      effectiveTheme,
      setTheme: setThemePreference,
    }),
    [preference, effectiveTheme, setThemePreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === null) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
