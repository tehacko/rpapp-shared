import {
  allowReadsForMutationMode,
  allowWritesForMutationMode,
  evaluatePosture,
  isEntitlementVisible,
  isVisibleForVisibilityMode,
} from '../evaluatePosture.js';
import {
  ENTITLEMENT_MUTATION_MODES,
  ENTITLEMENT_VISIBILITY_MODES,
  simpleEntitlementStateToAxes,
} from '../types.js';

describe('evaluatePosture', () => {
  it('maps ALLOW_WRITES to read and write allowed', () => {
    const posture = evaluatePosture({
      runtimeMode: 'ENABLED',
      visibilityMode: 'VISIBLE',
      mutationMode: 'ALLOW_WRITES',
    });
    expect(posture).toEqual({
      visible: true,
      allowReads: true,
      allowWrites: true,
    });
  });

  it('maps READ_ONLY to reads allowed and writes denied', () => {
    const posture = evaluatePosture({
      runtimeMode: 'ENABLED',
      visibilityMode: 'VISIBLE',
      mutationMode: 'READ_ONLY',
    });
    expect(posture).toEqual({
      visible: true,
      allowReads: true,
      allowWrites: false,
    });
  });

  it('maps BLOCK_ALL to read and write denied', () => {
    const posture = evaluatePosture({
      runtimeMode: 'DISABLED',
      visibilityMode: 'HIDDEN',
      mutationMode: 'BLOCK_ALL',
    });
    expect(posture).toEqual({
      visible: false,
      allowReads: false,
      allowWrites: false,
    });
  });

  it('denies reads for BLOCK_ALL regardless of visibility', () => {
    expect(
      evaluatePosture({
        runtimeMode: 'ALWAYS_ON',
        visibilityMode: 'VISIBLE',
        mutationMode: 'BLOCK_ALL',
      }).allowReads,
    ).toBe(false);
  });

  it('covers all mutationMode combinations for read/write matrix (§6.1)', () => {
    for (const mutationMode of ENTITLEMENT_MUTATION_MODES) {
      expect(allowReadsForMutationMode(mutationMode)).toBe(mutationMode !== 'BLOCK_ALL');
      expect(allowWritesForMutationMode(mutationMode)).toBe(mutationMode === 'ALLOW_WRITES');
    }
  });

  it('covers visibility axis combinations', () => {
    for (const visibilityMode of ENTITLEMENT_VISIBILITY_MODES) {
      expect(isVisibleForVisibilityMode(visibilityMode)).toBe(visibilityMode === 'VISIBLE');
      expect(
        isEntitlementVisible({
          runtimeMode: 'ENABLED',
          visibilityMode,
          mutationMode: 'READ_ONLY',
        }),
      ).toBe(visibilityMode === 'VISIBLE');
    }
  });

  it('maps SIMPLE states to expected posture (§6.4)', () => {
    expect(evaluatePosture(simpleEntitlementStateToAxes('on'))).toEqual({
      visible: true,
      allowReads: true,
      allowWrites: true,
    });
    expect(evaluatePosture(simpleEntitlementStateToAxes('softOffVisible'))).toEqual({
      visible: true,
      allowReads: true,
      allowWrites: false,
    });
    expect(evaluatePosture(simpleEntitlementStateToAxes('softOffHidden'))).toEqual({
      visible: false,
      allowReads: true,
      allowWrites: false,
    });
    expect(evaluatePosture(simpleEntitlementStateToAxes('off'))).toEqual({
      visible: false,
      allowReads: true,
      allowWrites: false,
    });
    expect(evaluatePosture(simpleEntitlementStateToAxes('hardOff'))).toEqual({
      visible: false,
      allowReads: false,
      allowWrites: false,
    });
  });
});
