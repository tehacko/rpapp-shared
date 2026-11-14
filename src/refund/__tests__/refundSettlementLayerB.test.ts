import {
  CASH_HANDOFF_REQUIRED_CODE,
  isCashRefundHandoffEligible,
  isRefundProviderOutcomeUnknown,
  mapRefundSettlementLayerBCs,
  mapRefundSettlementLayerBKey,
  PROVIDER_RESULT_UNKNOWN_CODE,
  RECONCILIATION_REQUIRED_CODE,
} from '../refundSettlementLayerB.js';

describe('refundSettlementLayerB', () => {
  it('maps Spec §8 four-state keys and CS labels', () => {
    expect(mapRefundSettlementLayerBKey('PENDING')).toBe('attempt_created');
    expect(mapRefundSettlementLayerBKey('REQUIRES_ACTION')).toBe('payment_waiting');
    expect(mapRefundSettlementLayerBKey('SUCCEEDED')).toBe('money_paid_out');
    expect(mapRefundSettlementLayerBKey('FAILED')).toBe('result_unknown');
    expect(mapRefundSettlementLayerBKey('REVERSED')).toBe('result_unknown');
    expect(mapRefundSettlementLayerBKey('CANCELED')).toBe('result_unknown');
    expect(mapRefundSettlementLayerBCs('REQUIRES_ACTION')).toBe('platba čeká');
    expect(mapRefundSettlementLayerBCs('SUCCEEDED')).toBe('peníze skutečně vyplaceny');
    expect(mapRefundSettlementLayerBCs('FAILED')).toBe('výsledek neznámý');
    expect(mapRefundSettlementLayerBCs('PENDING')).toBe('pokus založen');
  });

  it('providerOutcomeUnknown forces result_unknown (incl. open statuses)', () => {
    expect(
      mapRefundSettlementLayerBKey('PENDING', { providerOutcomeUnknown: true }),
    ).toBe('result_unknown');
    expect(
      mapRefundSettlementLayerBKey('REQUIRES_ACTION', { providerOutcomeUnknown: true }),
    ).toBe('result_unknown');
    expect(
      mapRefundSettlementLayerBKey('FAILED', { providerOutcomeUnknown: true }),
    ).toBe('result_unknown');
    expect(
      mapRefundSettlementLayerBCs('FAILED', { providerOutcomeUnknown: true }),
    ).toBe('výsledek neznámý');
  });

  it('cashHandoffSettled / SUCCEEDED → money_paid_out before unknown', () => {
    expect(
      mapRefundSettlementLayerBKey('FAILED', {
        cashHandoffSettled: true,
        providerOutcomeUnknown: true,
      }),
    ).toBe('money_paid_out');
    expect(mapRefundSettlementLayerBKey('SUCCEEDED', { providerOutcomeUnknown: true })).toBe(
      'money_paid_out',
    );
  });

  it('handoff-eligible open cash/alt-cash PENDING → payment_waiting (platba čeká)', () => {
    expect(
      mapRefundSettlementLayerBKey('PENDING', { cashHandoffEligible: true }),
    ).toBe('payment_waiting');
    expect(
      mapRefundSettlementLayerBCs('PENDING', { cashHandoffEligible: true }),
    ).toBe('platba čeká');
    expect(
      mapRefundSettlementLayerBKey('REQUIRES_ACTION', { cashHandoffEligible: true }),
    ).toBe('payment_waiting');
  });

  it('isRefundProviderOutcomeUnknown detects UNKNOWN-class / recon codes', () => {
    expect(isRefundProviderOutcomeUnknown(PROVIDER_RESULT_UNKNOWN_CODE)).toBe(true);
    expect(isRefundProviderOutcomeUnknown(RECONCILIATION_REQUIRED_CODE)).toBe(true);
    expect(isRefundProviderOutcomeUnknown('provider_result_unknown')).toBe(true);
    expect(isRefundProviderOutcomeUnknown(CASH_HANDOFF_REQUIRED_CODE)).toBe(false);
    expect(isRefundProviderOutcomeUnknown(null)).toBe(false);
    expect(isRefundProviderOutcomeUnknown(undefined)).toBe(false);
  });

  it('handoff eligible for cash ORIGINAL + CASH_HANDOFF_REQUIRED and ALTERNATIVE_CASH open', () => {
    expect(
      isCashRefundHandoffEligible({
        method: 'ORIGINAL',
        attemptStatus: 'REQUIRES_ACTION',
        providerFailureCode: CASH_HANDOFF_REQUIRED_CODE,
      }),
    ).toBe(true);
    expect(
      isCashRefundHandoffEligible({
        method: 'ALTERNATIVE_CASH',
        attemptStatus: 'PENDING',
      }),
    ).toBe(true);
    expect(
      isCashRefundHandoffEligible({
        method: 'ORIGINAL',
        attemptStatus: 'REQUIRES_ACTION',
        providerFailureCode: 'ORIGINAL_INSTRUMENT_UNAVAILABLE',
      }),
    ).toBe(false);
    expect(
      isCashRefundHandoffEligible({
        method: 'ORIGINAL',
        attemptStatus: 'SUCCEEDED',
        providerFailureCode: CASH_HANDOFF_REQUIRED_CODE,
      }),
    ).toBe(false);
  });

  it('ALTERNATIVE_CASH+PENDING handoff-eligible maps Layer B to platba čeká (not pokus založen)', () => {
    const eligible = isCashRefundHandoffEligible({
      method: 'ALTERNATIVE_CASH',
      attemptStatus: 'PENDING',
    });
    expect(eligible).toBe(true);
    expect(
      mapRefundSettlementLayerBCs('PENDING', { cashHandoffEligible: eligible }),
    ).toBe('platba čeká');
  });
});
