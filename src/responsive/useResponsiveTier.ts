import { useEffect, useState } from 'react';
import { BREAKPOINTS, tierFromWidth, type ResponsiveTier } from './breakpoints.js';

const DEFAULT_TIER: ResponsiveTier = 'compact';

function readTierFromWindow(): ResponsiveTier {
  if (typeof window === 'undefined') {
    return DEFAULT_TIER;
  }
  return tierFromWidth(window.innerWidth);
}

/**
 * Shell-only runtime tier helper (SSR-safe). Do not branch feature layout on this.
 */
export function useResponsiveTier(): ResponsiveTier {
  const [tier, setTier] = useState<ResponsiveTier>(DEFAULT_TIER);

  useEffect(() => {
    const update = (): void => {
      setTier(readTierFromWindow());
    };
    update();
    const mqMd = window.matchMedia(`(min-width: ${String(BREAKPOINTS.md)}px)`);
    const mqLg = window.matchMedia(`(min-width: ${String(BREAKPOINTS.lg)}px)`);
    mqMd.addEventListener('change', update);
    mqLg.addEventListener('change', update);
    window.addEventListener('resize', update);
    return () => {
      mqMd.removeEventListener('change', update);
      mqLg.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return tier;
}
