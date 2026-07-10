/**
 * Cross-surface responsive breakpoint SSOT (Tailwind v4 Option A defaults).
 * wide (1440) is test-viewport only — see TEST_VIEWPORTS.wide, not BREAKPOINTS.
 */
export const RESPONSIVE_CONTRACT_VERSION = '1.0.0';

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type BreakpointToken = keyof typeof BREAKPOINTS;

/** Semantic density tiers — not 1:1 with Tailwind tokens. */
export const RESPONSIVE_TIER_BOUNDS = {
  compact: { maxWidth: BREAKPOINTS.md - 1 },
  comfortable: { minWidth: BREAKPOINTS.md, maxWidth: BREAKPOINTS.lg - 1 },
  expanded: { minWidth: BREAKPOINTS.lg },
} as const;

/** Alias for RESPONSIVE_TIER_BOUNDS — preferred import name in shell code. */
export const RESPONSIVE_TIERS = RESPONSIVE_TIER_BOUNDS;

export type ResponsiveTier = keyof typeof RESPONSIVE_TIER_BOUNDS;

/** Playwright / acceptance matrix viewports (wide is PO mockup tier only). */
export const TEST_VIEWPORTS = {
  phoneSmall: { width: 320, height: 568 },
  phone: { width: 390, height: 844 },
  phoneLandscape: { width: 844, height: 390 },
  tablet: { width: 768, height: 1024 },
  tabletLandscape: { width: 1024, height: 768 },
  desktop: { width: 1280, height: 900 },
  wide: { width: 1440, height: 900 },
} as const;

export function tierFromWidth(widthPx: number): ResponsiveTier {
  if (widthPx >= RESPONSIVE_TIER_BOUNDS.expanded.minWidth) {
    return 'expanded';
  }
  if (widthPx >= RESPONSIVE_TIER_BOUNDS.comfortable.minWidth) {
    return 'comfortable';
  }
  return 'compact';
}
