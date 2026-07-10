/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { BREAKPOINTS, tierFromWidth, RESPONSIVE_TIER_BOUNDS, RESPONSIVE_TIERS } from './breakpoints.js';
import { useResponsiveTier } from './useResponsiveTier.js';

describe('responsive breakpoints', () => {
  it('matches Tailwind v4 Option A defaults', () => {
    expect(BREAKPOINTS.sm).toBe(640);
    expect(BREAKPOINTS.md).toBe(768);
    expect(BREAKPOINTS.lg).toBe(1024);
    expect(BREAKPOINTS.xl).toBe(1280);
    expect(BREAKPOINTS['2xl']).toBe(1536);
  });

  it('maps widths to semantic tiers', () => {
    expect(tierFromWidth(320)).toBe('compact');
    expect(tierFromWidth(639)).toBe('compact');
    expect(tierFromWidth(768)).toBe('comfortable');
    expect(tierFromWidth(1023)).toBe('comfortable');
    expect(tierFromWidth(1024)).toBe('expanded');
    expect(tierFromWidth(1440)).toBe('expanded');
  });

  it('keeps tier bounds aligned with breakpoints', () => {
    expect(RESPONSIVE_TIER_BOUNDS.compact.maxWidth).toBe(BREAKPOINTS.md - 1);
    expect(RESPONSIVE_TIER_BOUNDS.comfortable.minWidth).toBe(BREAKPOINTS.md);
    expect(RESPONSIVE_TIER_BOUNDS.expanded.minWidth).toBe(BREAKPOINTS.lg);
  });

  it('exports RESPONSIVE_TIERS as alias for RESPONSIVE_TIER_BOUNDS', () => {
    expect(RESPONSIVE_TIERS).toBe(RESPONSIVE_TIER_BOUNDS);
  });
});

describe('tierFromWidth', () => {
  it('returns compact below md', () => {
    expect(tierFromWidth(0)).toBe('compact');
  });
});

describe('useResponsiveTier', () => {
  const mediaListeners = new Map<string, Set<() => void>>();

  beforeEach(() => {
    mediaListeners.clear();
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 320,
    });
    window.matchMedia = jest.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: (_event: string, listener: () => void) => {
        const bucket = mediaListeners.get(query) ?? new Set<() => void>();
        bucket.add(listener);
        mediaListeners.set(query, bucket);
      },
      removeEventListener: (_event: string, listener: () => void) => {
        mediaListeners.get(query)?.delete(listener);
      },
      dispatchEvent: jest.fn(),
    })) as unknown as typeof window.matchMedia;
  });

  it('returns compact below md on mount', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 390 });
    const { result } = renderHook(() => useResponsiveTier());
    expect(result.current).toBe('compact');
  });

  it('returns comfortable at md width', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: BREAKPOINTS.md });
    const { result } = renderHook(() => useResponsiveTier());
    expect(result.current).toBe('comfortable');
  });

  it('returns expanded at lg width', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: BREAKPOINTS.lg });
    const { result } = renderHook(() => useResponsiveTier());
    expect(result.current).toBe('expanded');
  });

  it('updates tier when resize fires', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 320 });
    const { result } = renderHook(() => useResponsiveTier());
    expect(result.current).toBe('compact');

    act(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: BREAKPOINTS.lg });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe('expanded');
  });

  it('registers matchMedia listeners at md and lg breakpoints', () => {
    renderHook(() => useResponsiveTier());
    expect(window.matchMedia).toHaveBeenCalledWith(`(min-width: ${String(BREAKPOINTS.md)}px)`);
    expect(window.matchMedia).toHaveBeenCalledWith(`(min-width: ${String(BREAKPOINTS.lg)}px)`);
  });

  it('updates tier when matchMedia change fires', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 320 });
    const { result } = renderHook(() => useResponsiveTier());
    expect(result.current).toBe('compact');

    const mdQuery = `(min-width: ${String(BREAKPOINTS.md)}px)`;
    act(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: BREAKPOINTS.md });
      for (const listener of mediaListeners.get(mdQuery) ?? []) {
        listener();
      }
    });

    expect(result.current).toBe('comfortable');
  });
});
