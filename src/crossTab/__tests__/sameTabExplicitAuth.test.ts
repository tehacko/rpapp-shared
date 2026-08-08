import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  clearSameTabExplicitAuth,
  hasSameTabExplicitAuth,
  markSameTabExplicitAuth,
} from '../sameTabExplicitAuth.js';

describe('sameTabExplicitAuth (XT-G12 / G20)', () => {
  beforeEach(() => {
    clearSameTabExplicitAuth();
  });

  it('is false by default', () => {
    expect(hasSameTabExplicitAuth(1_000)).toBe(false);
  });

  it('is true within TTL after mark', () => {
    markSameTabExplicitAuth(1_000);
    expect(hasSameTabExplicitAuth(1_000)).toBe(true);
    expect(hasSameTabExplicitAuth(1_000 + 7_999)).toBe(true);
  });

  it('expires after TTL', () => {
    markSameTabExplicitAuth(1_000);
    expect(hasSameTabExplicitAuth(1_000 + 8_000)).toBe(false);
  });

  it('clear resets the flag', () => {
    markSameTabExplicitAuth(1_000);
    clearSameTabExplicitAuth();
    expect(hasSameTabExplicitAuth(1_000)).toBe(false);
  });
});
