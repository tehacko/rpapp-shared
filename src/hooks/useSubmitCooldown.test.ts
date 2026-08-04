/**
 * @jest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react';
import { useSubmitCooldown } from './useSubmitCooldown.js';

describe('useSubmitCooldown', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts, ticks, and clears cooldown', () => {
    const { result } = renderHook(() => useSubmitCooldown());
    expect(result.current.isCoolingDown).toBe(false);

    act(() => {
      result.current.startCooldown(0);
    });
    expect(result.current.isCoolingDown).toBe(false);

    act(() => {
      result.current.startCooldown(2000);
    });
    expect(result.current.isCoolingDown).toBe(true);

    act(() => {
      jest.advanceTimersByTime(250);
    });
    expect(result.current.remainingSeconds).toBeGreaterThan(0);

    act(() => {
      result.current.clearCooldown();
    });
    expect(result.current.isCoolingDown).toBe(false);

    act(() => {
      result.current.startCooldown(500);
      jest.advanceTimersByTime(600);
    });
    expect(result.current.isCoolingDown).toBe(false);
  });
});
