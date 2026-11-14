import {
  filterRefundMethodsFromSlotProfile,
  inferRefundProviderSlotId,
  isCompleteManualAttestationEvidence,
  mapRefundSettlementFourState,
  resolveRefundProviderSlotProfile,
  seedRefundProviderSlotProfile,
} from '../refundProviderSlotProfile.js';

/**
 * DELTA-REF-T01…T05 method filter / seed matrix (shared lean).
 *
 * OOS BRÁNA ≠PASS (honesty — not Resolved): C8-T18, ALTERNATIVE_BANK API,
 * R58, R61, R70, R73.
 */
describe('filterRefundMethodsFromSlotProfile (section 16.3)', () => {
  it('DELTA-REF-T02: ORIGINAL on NATIVE+PROVIDER_TRUTH; hides bank + alt cash until failure', () => {
    const offer = filterRefundMethodsFromSlotProfile({
      profile: seedRefundProviderSlotProfile('GOPAY'),
    });
    expect(offer.offered).toEqual(['ORIGINAL']);
    expect(offer.positiveOriginalPath).toBe(true);
    expect(offer.hideAlternativeBank).toBe(true);
    expect(offer.alternativeCashRequiresEscalation).toBe(true);
  });

  it('DELTA-REF-T05: ALTERNATIVE_CASH only after proven ORIGINAL failure + escalation', () => {
    const before = filterRefundMethodsFromSlotProfile({
      profile: seedRefundProviderSlotProfile('GOPAY'),
      originalProvenFailedOrUnavailable: true,
      alternativeCashEscalationApproved: false,
    });
    expect(before.offered).not.toContain('ALTERNATIVE_CASH');

    const offer = filterRefundMethodsFromSlotProfile({
      profile: seedRefundProviderSlotProfile('GOPAY'),
      originalProvenFailedOrUnavailable: true,
      alternativeCashEscalationApproved: true,
    });
    expect(offer.offered).toContain('ALTERNATIVE_CASH');
    expect(offer.offered).not.toContain('ALTERNATIVE_BANK');
  });

  it('CASH handoff seed keeps ORIGINAL and hides bank', () => {
    const offer = filterRefundMethodsFromSlotProfile({
      profile: seedRefundProviderSlotProfile('CASH'),
    });
    expect(offer.offered).toContain('ORIGINAL');
    expect(offer.hideAlternativeBank).toBe(true);
    expect(offer.positiveOriginalPath).toBe(false);
  });

  it('DELTA-REF-T01: FIO seed ≠ NATIVE_API_AVAILABLE; bank unavailable', () => {
    const profile = seedRefundProviderSlotProfile('FIO');
    expect(profile.nativeOriginalAbility).toBe('NATIVE_API_UNAVAILABLE');
    expect(profile.nativeOriginalAbility).not.toBe('NATIVE_API_AVAILABLE');
    expect(profile.settlementMode).toBe('MANUAL_EXTERNAL');
    expect(profile.payoutEvidence).toBe('MANUAL_ATTESTATION');
    expect(profile.alternativeBankUnavailable).toBe(true);
  });

  it('DELTA-REF-T03: FIO MANUAL path — settle evidence is MANUAL_ATTESTATION; bank hidden', () => {
    const profile = seedRefundProviderSlotProfile('FIO');
    expect(profile.payoutEvidence).toBe('MANUAL_ATTESTATION');
    expect(isCompleteManualAttestationEvidence({
      evidenceType: 'bank_slip',
      evidenceReference: 'fio-ref-1',
      attestedByActorId: 3,
      attestedAt: '2026-11-14T00:00:00.000Z',
    })).toBe(true);
    const offer = filterRefundMethodsFromSlotProfile({ profile });
    expect(offer.offered).toEqual(['ORIGINAL']);
    expect(offer.hideAlternativeBank).toBe(true);
    expect(offer.positiveOriginalPath).toBe(false);
  });

  it('DELTA-REF-T04: resolve prefers attempt snapshot over live flip', () => {
    const snapshot = {
      ...seedRefundProviderSlotProfile('GOPAY'),
      snapshotAt: '2026-11-14T12:00:00.000Z',
    };
    const live = {
      ...seedRefundProviderSlotProfile('GOPAY'),
      nativeOriginalAbility: 'NATIVE_API_UNAVAILABLE' as const,
      settlementMode: 'MANUAL_EXTERNAL' as const,
      payoutEvidence: 'MANUAL_ATTESTATION' as const,
    };
    const resolved = resolveRefundProviderSlotProfile({ snapshot, live });
    expect(resolved).not.toBeNull();
    expect(resolved?.nativeOriginalAbility).toBe('NATIVE_API_AVAILABLE');
    expect(resolved?.settlementMode).toBe('PROVIDER_TRUTH');
    expect(resolved?.payoutEvidence).toBe('PROVIDER_EVENT');
  });

  it('G8: infer fails closed on bare CARD/BANK — never invent GOPAY/FIO', () => {
    expect(inferRefundProviderSlotId('CARD')).toBeNull();
    expect(inferRefundProviderSlotId('BANK_TRANSFER')).toBeNull();
    expect(inferRefundProviderSlotId('BANK')).toBeNull();
    expect(inferRefundProviderSlotId('GOPAY')).toBe('GOPAY');
    expect(inferRefundProviderSlotId('FIO')).toBe('FIO');
    expect(inferRefundProviderSlotId('CASH')).toBe('CASH');
    expect(resolveRefundProviderSlotProfile({ providerHint: 'CARD' })).toBeNull();
  });
});

describe('mapRefundSettlementFourState Layer B', () => {
  it('never maps PENDING/REQUIRES_ACTION to MONEY_PAID_OUT (Layer B ≠ Layer A)', () => {
    expect(mapRefundSettlementFourState({ attemptStatus: 'PENDING' })).toBe('PAYMENT_PENDING');
    expect(mapRefundSettlementFourState({ attemptStatus: 'REQUIRES_ACTION' })).toBe(
      'PAYMENT_PENDING',
    );
    expect(mapRefundSettlementFourState({ attemptStatus: 'SUCCEEDED' })).toBe('MONEY_PAID_OUT');
    expect(mapRefundSettlementFourState({ attemptStatus: null })).toBe('ATTEMPT_CREATED');
  });
});

describe('OOS BRANA !=PASS honesty (shared — titles only)', () => {
  it('C8-T18 / ALTERNATIVE_BANK API / R58 / R61 / R70 / R73 remain BRANA !=PASS', () => {
    const oos = ['C8-T18', 'ALTERNATIVE_BANK_API', 'R58', 'R61', 'R70', 'R73'] as const;
    expect(oos).toHaveLength(6);
  });
});

describe('isCompleteManualAttestationEvidence', () => {
  it('requires type, reference, actor, attestedAt', () => {
    expect(
      isCompleteManualAttestationEvidence({
        evidenceType: 'bank_slip',
        evidenceReference: 'ref-1',
        attestedByActorId: 7,
        attestedAt: '2026-07-01T00:00:00.000Z',
      }),
    ).toBe(true);
    expect(
      isCompleteManualAttestationEvidence({
        evidenceType: '',
        evidenceReference: 'ref-1',
        attestedByActorId: 7,
        attestedAt: '2026-07-01T00:00:00.000Z',
      }),
    ).toBe(false);
  });
});