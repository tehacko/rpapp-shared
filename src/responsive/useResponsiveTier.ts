import { useEffect, useState } from 'react';
import { BREAKPOINTS, tierFromWidth, type ResponsiveTier } from './breakpoints.js';

const RESIZE_DEBOUNCE_MS = 100;

/**
 * Shell-only runtime tier helper (SSR-safe). Do not branch feature layout on this.
 * Sync-init from `window.innerWidth` avoids a compact-default flash on first paint.
 */
export function useResponsiveTier(): ResponsiveTier {
  const [tier, setTier] = useState<ResponsiveTier>(() =>
    tierFromWidth(typeof window !== 'undefined' ? window.innerWidth : BREAKPOINTS.md),
  );

  useEffect(() => {
    const update = (): void => {
      setTier(tierFromWidth(window.innerWidth));
    };

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const onResize = (): void => {
      if (resizeTimer !== null) {
        clearTimeout(resizeTimer);
      }
      resizeTimer = setTimeout(() => {
        resizeTimer = null;
        update();
      }, RESIZE_DEBOUNCE_MS);
    };

    const mqMd = window.matchMedia(`(min-width: ${String(BREAKPOINTS.md)}px)`);
    const mqLg = window.matchMedia(`(min-width: ${String(BREAKPOINTS.lg)}px)`);
    mqMd.addEventListener('change', update);
    mqLg.addEventListener('change', update);
    window.addEventListener('resize', onResize);
    return () => {
      mqMd.removeEventListener('change', update);
      mqLg.removeEventListener('change', update);
      window.removeEventListener('resize', onResize);
      if (resizeTimer !== null) {
        clearTimeout(resizeTimer);
      }
    };
  }, []);

  return tier;
}
