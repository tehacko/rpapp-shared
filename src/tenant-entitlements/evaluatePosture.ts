/**
 * Derives read/write posture from entitlement block axes (§6.1).
 */
import type {
  EntitlementBlockAxes,
  EntitlementMutationMode,
  EntitlementVisibilityMode,
  EvaluatedEntitlementPosture,
} from './types.js';

/** Nav/API visibility — true when block is not hidden from admin nav (§11.0). */
export function isEntitlementVisible(axes: EntitlementBlockAxes): boolean {
  return axes.visibilityMode === 'VISIBLE';
}

export function allowReadsForMutationMode(mutationMode: EntitlementMutationMode): boolean {
  return mutationMode !== 'BLOCK_ALL';
}

export function allowWritesForMutationMode(mutationMode: EntitlementMutationMode): boolean {
  return mutationMode === 'ALLOW_WRITES';
}

export function evaluatePosture(axes: EntitlementBlockAxes): EvaluatedEntitlementPosture {
  return {
    visible: isEntitlementVisible(axes),
    allowReads: allowReadsForMutationMode(axes.mutationMode),
    allowWrites: allowWritesForMutationMode(axes.mutationMode),
  };
}

export function isVisibleForVisibilityMode(visibilityMode: EntitlementVisibilityMode): boolean {
  return visibilityMode === 'VISIBLE';
}
