import { computeUtcDateSpanDaysInclusive } from '../analyticsExploreCaps.js';

describe('computeUtcDateSpanDaysInclusive', () => {
  it('computes inclusive UTC date spans', () => {
    expect(computeUtcDateSpanDaysInclusive('2026-01-01', '2026-01-01')).toBe(1);
    expect(computeUtcDateSpanDaysInclusive('2026-01-01', '2026-01-03')).toBe(3);
  });

  it('returns infinity for invalid or reversed ranges', () => {
    expect(computeUtcDateSpanDaysInclusive('bad', '2026-01-01')).toBe(Number.POSITIVE_INFINITY);
    expect(computeUtcDateSpanDaysInclusive('2026-01-03', '2026-01-01')).toBe(
      Number.POSITIVE_INFINITY,
    );
  });
});
