/**
 * V1A DELTA 04 / HSS 04 section 16 v1.4 — RefundProviderSlotProfile contract + section 16.3 method offer.
 *
 * W2 owns Prisma/API persistence. This module is the FE/shared SoT for typed shapes,
 * seed presets, method filter, Layer A disclosure labels, and Layer B section-8 four-state.
 * Do NOT persist deprecated composite aliases as authoritative enums.
 */

import type { RefundAttemptStatus, RefundMethod, RefundReadMethod } from './refundContracts.js';

export const REFUND_PROVIDER_SLOT_IDS = [
  'GOPAY',
  'STRIPE',
  'GP_WEBPAY',
  'CASH',
  'FIO',
] as const;

export type RefundProviderSlotId = (typeof REFUND_PROVIDER_SLOT_IDS)[number];

export const REFUND_NATIVE_ORIGINAL_ABILITIES = [
  'NATIVE_API_AVAILABLE',
  'NATIVE_API_UNAVAILABLE',
] as const;

export type RefundNativeOriginalAbility =
  (typeof REFUND_NATIVE_ORIGINAL_ABILITIES)[number];

export const REFUND_SETTLEMENT_MODES = [
  'PROVIDER_TRUTH',
  'CASH_HANDOFF',
  'MANUAL_EXTERNAL',
] as const;

export type RefundSettlementMode = (typeof REFUND_SETTLEMENT_MODES)[number];

export const REFUND_PAYOUT_EVIDENCE_KINDS = [
  'PROVIDER_EVENT',
  'CASH_HANDOFF_ATTESTATION',
  'MANUAL_ATTESTATION',
] as const;

export type RefundPayoutEvidenceKind = (typeof REFUND_PAYOUT_EVIDENCE_KINDS)[number];

/** One registry row per slot = four required axes (section 16.2). */
export interface RefundProviderSlotProfile {
  readonly slotId: RefundProviderSlotId;
  readonly nativeOriginalAbility: RefundNativeOriginalAbility;
  readonly settlementMode: RefundSettlementMode;
  readonly payoutEvidence: RefundPayoutEvidenceKind;
  /** V1A default true on ALL slots until Finance/Legal BRANA unlock. */
  readonly alternativeBankUnavailable: boolean;
}

/** Attempt-time snapshot — mid-flight registry flip != second payout (DELTA-REF-T04). */
export type RefundProviderSlotProfileSnapshot = RefundProviderSlotProfile & {
  readonly snapshotAt: string;
};

/** Section-8 Layer B settlement disclosure — never reuse settlementMode strings as these labels. */
export const REFUND_SETTLEMENT_FOUR_STATES = [
  'ATTEMPT_CREATED',
  'PAYMENT_PENDING',
  'OUTCOME_UNKNOWN',
  'MONEY_PAID_OUT',
] as const;

export type RefundSettlementFourState = (typeof REFUND_SETTLEMENT_FOUR_STATES)[number];

export const REFUND_SETTLEMENT_FOUR_STATE_CS: Readonly<
  Record<RefundSettlementFourState, string>
> = {
  ATTEMPT_CREATED: 'Pokus založen',
  PAYMENT_PENDING: 'Platba čeká',
  OUTCOME_UNKNOWN: 'Výsledek neznámý',
  MONEY_PAID_OUT: 'Peníze skutečně vyplaceny',
};

/** Methods the UI may offer; ALTERNATIVE_BANK is never a production write method. */
export type RefundOfferedMethod = RefundMethod | 'ALTERNATIVE_BANK';

export interface RefundMethodOffer {
  readonly offered: readonly RefundOfferedMethod[];
  readonly defaultMethod: RefundMethod;
  /** True when ORIGINAL is the positive native/provider-truth path (DELTA-REF-T02). */
  readonly positiveOriginalPath: boolean;
  /** Hide/disable bank create when true (section 16.3 + alternativeBankUnavailable). */
  readonly hideAlternativeBank: boolean;
  /** ALTERNATIVE_CASH allowed only after proven native ORIGINAL failure + escalation. */
  readonly alternativeCashRequiresEscalation: boolean;
  readonly reasons: readonly string[];
}

export interface FilterRefundMethodsInput {
  readonly profile: RefundProviderSlotProfile;
  /**
   * Proven native ORIGINAL failure/unavailability (DELTA-REF-T05).
   * Required before offering/creating ALTERNATIVE_CASH under native+PROVIDER_TRUTH.
   */
  readonly originalProvenFailedOrUnavailable?: boolean;
  /** Staff/escalation approval for alt cash after native failure. */
  readonly alternativeCashEscalationApproved?: boolean;
}

/** V1A seed presets (section 16.2.4) — seed == runtime until W2 live API. */
export const REFUND_PROVIDER_SLOT_PROFILE_SEEDS: Readonly<
  Record<RefundProviderSlotId, RefundProviderSlotProfile>
> = {
  GOPAY: {
    slotId: 'GOPAY',
    nativeOriginalAbility: 'NATIVE_API_AVAILABLE',
    settlementMode: 'PROVIDER_TRUTH',
    payoutEvidence: 'PROVIDER_EVENT',
    alternativeBankUnavailable: true,
  },
  STRIPE: {
    slotId: 'STRIPE',
    nativeOriginalAbility: 'NATIVE_API_AVAILABLE',
    settlementMode: 'PROVIDER_TRUTH',
    payoutEvidence: 'PROVIDER_EVENT',
    alternativeBankUnavailable: true,
  },
  GP_WEBPAY: {
    slotId: 'GP_WEBPAY',
    nativeOriginalAbility: 'NATIVE_API_UNAVAILABLE',
    settlementMode: 'MANUAL_EXTERNAL',
    payoutEvidence: 'MANUAL_ATTESTATION',
    alternativeBankUnavailable: true,
  },
  CASH: {
    slotId: 'CASH',
    nativeOriginalAbility: 'NATIVE_API_UNAVAILABLE',
    settlementMode: 'CASH_HANDOFF',
    payoutEvidence: 'CASH_HANDOFF_ATTESTATION',
    alternativeBankUnavailable: true,
  },
  FIO: {
    slotId: 'FIO',
    nativeOriginalAbility: 'NATIVE_API_UNAVAILABLE',
    settlementMode: 'MANUAL_EXTERNAL',
    payoutEvidence: 'MANUAL_ATTESTATION',
    alternativeBankUnavailable: true,
  },
};

export function isRefundProviderSlotId(value: unknown): value is RefundProviderSlotId {
  return (
    typeof value === 'string' &&
    (REFUND_PROVIDER_SLOT_IDS as readonly string[]).includes(value)
  );
}

export function seedRefundProviderSlotProfile(
  slotId: RefundProviderSlotId,
): RefundProviderSlotProfile {
  return REFUND_PROVIDER_SLOT_PROFILE_SEEDS[slotId];
}

/**
 * Section 16.3 method offer from slot profile — not legacy single-enum rows.
 * ALTERNATIVE_BANK is never offered when alternativeBankUnavailable=true (V1A default).
 */
export function filterRefundMethodsFromSlotProfile(
  input: FilterRefundMethodsInput,
): RefundMethodOffer {
  const { profile } = input;
  const originalFailed = input.originalProvenFailedOrUnavailable === true;
  const altCashApproved = input.alternativeCashEscalationApproved === true;
  const hideBank = profile.alternativeBankUnavailable !== false;
  const reasons: string[] = [];
  const offered: RefundOfferedMethod[] = [];

  const nativeProviderTruth =
    profile.nativeOriginalAbility === 'NATIVE_API_AVAILABLE' &&
    profile.settlementMode === 'PROVIDER_TRUTH';

  const positiveOriginalPath = nativeProviderTruth;

  offered.push('ORIGINAL');
  if (nativeProviderTruth) {
    reasons.push('NATIVE_API_AVAILABLE+PROVIDER_TRUTH->ORIGINAL');
  } else if (profile.settlementMode === 'CASH_HANDOFF') {
    reasons.push('CASH_HANDOFF->ORIGINAL_handoff_first');
  } else if (profile.settlementMode === 'MANUAL_EXTERNAL') {
    reasons.push('MANUAL_EXTERNAL->ORIGINAL_requires_MANUAL_ATTESTATION');
  } else if (profile.nativeOriginalAbility === 'NATIVE_API_UNAVAILABLE') {
    reasons.push('NATIVE_API_UNAVAILABLE->ORIGINAL_REQUIRES_ACTION_no_fake_SUCCEEDED');
  }

  let alternativeCashRequiresEscalation = false;
  if (nativeProviderTruth) {
    alternativeCashRequiresEscalation = true;
    if (originalFailed && altCashApproved) {
      offered.push('ALTERNATIVE_CASH');
      reasons.push('ALT_CASH_after_proven_ORIGINAL_failure+escalation');
    } else {
      reasons.push('ALT_CASH_hidden_until_ORIGINAL_failed+escalation');
    }
  } else if (profile.settlementMode === 'CASH_HANDOFF') {
    if (originalFailed) {
      offered.push('ALTERNATIVE_CASH');
      reasons.push('CASH_HANDOFF->ALT_CASH_handoff_first');
    } else {
      reasons.push('CASH_HANDOFF->ALT_CASH_after_ORIGINAL_path');
    }
  } else if (profile.settlementMode === 'MANUAL_EXTERNAL') {
    alternativeCashRequiresEscalation = true;
    if (altCashApproved) {
      offered.push('ALTERNATIVE_CASH');
      reasons.push('MANUAL_EXTERNAL->ALT_CASH_optional_not_auto');
    } else {
      reasons.push('MANUAL_EXTERNAL->ALT_CASH_not_auto');
    }
  }

  if (!hideBank) {
    offered.push('ALTERNATIVE_BANK');
    reasons.push('alternativeBankUnavailable=false->BANK_visible_BRANA');
  } else {
    reasons.push('alternativeBankUnavailable=true->hide_ALTERNATIVE_BANK');
  }

  const writeOffered = offered.filter((m): m is RefundMethod => m !== 'ALTERNATIVE_BANK');
  const defaultMethod: RefundMethod =
    writeOffered.includes('ORIGINAL') ? 'ORIGINAL' : (writeOffered[0] ?? 'ORIGINAL');

  return {
    offered,
    defaultMethod,
    positiveOriginalPath,
    hideAlternativeBank: hideBank,
    alternativeCashRequiresEscalation,
    reasons,
  };
}

export function isRefundMethodOffered(
  offer: RefundMethodOffer,
  method: RefundOfferedMethod,
): boolean {
  return offer.offered.includes(method);
}

/** Layer A — honest profile disclosure (!= Layer B Czech progress labels). */
export interface RefundSlotProfileDisclosure {
  readonly slotId: RefundProviderSlotId;
  readonly nativeOriginalAbility: RefundNativeOriginalAbility;
  readonly settlementMode: RefundSettlementMode;
  readonly payoutEvidence: RefundPayoutEvidenceKind;
  readonly alternativeBankUnavailable: boolean;
  readonly pathSummaryCs: string;
}

export function describeSlotProfileDisclosure(
  profile: RefundProviderSlotProfile,
): RefundSlotProfileDisclosure {
  let pathSummaryCs: string;
  if (
    profile.nativeOriginalAbility === 'NATIVE_API_AVAILABLE' &&
    profile.settlementMode === 'PROVIDER_TRUTH'
  ) {
    pathSummaryCs = 'Automatická původní cesta (provider truth / PROVIDER_EVENT)';
  } else if (profile.settlementMode === 'CASH_HANDOFF') {
    pathSummaryCs = 'Hotovost — handoff-first (CASH_HANDOFF_ATTESTATION); create ≠ výplata';
  } else if (profile.payoutEvidence === 'MANUAL_ATTESTATION') {
    pathSummaryCs = 'Manuální / evidovaná výplata (MANUAL_ATTESTATION); není auto banka';
  } else {
    pathSummaryCs = 'Profil railu dle slotu — ověřte settlementMode a payoutEvidence';
  }

  return {
    slotId: profile.slotId,
    nativeOriginalAbility: profile.nativeOriginalAbility,
    settlementMode: profile.settlementMode,
    payoutEvidence: profile.payoutEvidence,
    alternativeBankUnavailable: profile.alternativeBankUnavailable,
    pathSummaryCs,
  };
}

export interface MapRefundSettlementFourStateInput {
  readonly attemptStatus: RefundAttemptStatus | null | undefined;
  readonly cashHandoffSettled?: boolean;
  readonly providerOutcomeUnknown?: boolean;
}

/**
 * Layer B — Spec section-8 four-state from attempt/provider + handoff.
 * Never map settlementMode=CASH_HANDOFF -> MONEY_PAID_OUT.
 */
export function mapRefundSettlementFourState(
  input: MapRefundSettlementFourStateInput,
): RefundSettlementFourState {
  if (input.cashHandoffSettled === true || input.attemptStatus === 'SUCCEEDED') {
    return 'MONEY_PAID_OUT';
  }
  if (input.providerOutcomeUnknown === true) {
    return 'OUTCOME_UNKNOWN';
  }
  if (
    input.attemptStatus === 'REQUIRES_ACTION' ||
    input.attemptStatus === 'PENDING' ||
    input.attemptStatus === 'FAILED'
  ) {
    // Open rail / cash handoff wait = platba ceka — never vyplaceny.
    return 'PAYMENT_PENDING';
  }
  if (input.attemptStatus === 'REVERSED' || input.attemptStatus === 'CANCELED') {
    return 'OUTCOME_UNKNOWN';
  }
  return 'ATTEMPT_CREATED';
}

export function refundSettlementFourStateCs(state: RefundSettlementFourState): string {
  return REFUND_SETTLEMENT_FOUR_STATE_CS[state];
}

/** G6 — MANUAL_ATTESTATION evidence contract (settle blocked without complete evidence). */
export interface ManualAttestationEvidence {
  readonly evidenceType: string;
  readonly evidenceReference: string;
  readonly attestedByActorId: number;
  readonly attestedAt: string;
  readonly notes?: string | null;
  readonly attachmentId?: string | null;
}

export function isCompleteManualAttestationEvidence(
  value: unknown,
): value is ManualAttestationEvidence {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const row = value as Partial<ManualAttestationEvidence>;
  return (
    typeof row.evidenceType === 'string' &&
    row.evidenceType.trim().length > 0 &&
    typeof row.evidenceReference === 'string' &&
    row.evidenceReference.trim().length > 0 &&
    typeof row.attestedByActorId === 'number' &&
    Number.isInteger(row.attestedByActorId) &&
    row.attestedByActorId > 0 &&
    typeof row.attestedAt === 'string' &&
    row.attestedAt.trim().length > 0
  );
}

/**
 * Precise provider → slot only. Bare CARD / BANK_TRANSFER / unknown → null (fail-closed).
 * Never invent GOPAY/FIO from ambiguous payment method labels (G8).
 */
export function inferRefundProviderSlotId(
  providerOrSlot: string | null | undefined,
): RefundProviderSlotId | null {
  if (providerOrSlot == null || providerOrSlot.trim().length === 0) {
    return null;
  }
  const normalized = providerOrSlot.trim().toUpperCase().replace(/[\s-]+/g, '_');
  if (isRefundProviderSlotId(normalized)) {
    return normalized;
  }
  if (normalized.includes('STRIPE')) {
    return 'STRIPE';
  }
  // FIO QR / explicit Fio only — bare BANK / BANK_TRANSFER must not invent FIO.
  if (normalized.includes('FIO')) {
    return 'FIO';
  }
  if (normalized.includes('CASH') || normalized.includes('HOTOV')) {
    return 'CASH';
  }
  if (normalized.includes('WEBPAY') || normalized.includes('GP_WEBPAY')) {
    return 'GP_WEBPAY';
  }
  if (normalized.includes('GOPAY') || normalized.includes('GO_PAY')) {
    return 'GOPAY';
  }
  return null;
}

export function buildRefundProviderSlotProfileSnapshot(
  profile: RefundProviderSlotProfile,
  snapshotAt: string = new Date().toISOString(),
): RefundProviderSlotProfileSnapshot {
  return {
    slotId: profile.slotId,
    nativeOriginalAbility: profile.nativeOriginalAbility,
    settlementMode: profile.settlementMode,
    payoutEvidence: profile.payoutEvidence,
    alternativeBankUnavailable: profile.alternativeBankUnavailable,
    snapshotAt,
  };
}

export function parseRefundProviderSlotProfileSnapshot(
  raw: unknown,
): RefundProviderSlotProfileSnapshot | null {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }
  const row = raw as Record<string, unknown>;
  if (
    !isRefundProviderSlotId(row['slotId']) ||
    !(REFUND_NATIVE_ORIGINAL_ABILITIES as readonly string[]).includes(
      String(row['nativeOriginalAbility']),
    ) ||
    !(REFUND_SETTLEMENT_MODES as readonly string[]).includes(String(row['settlementMode'])) ||
    !(REFUND_PAYOUT_EVIDENCE_KINDS as readonly string[]).includes(String(row['payoutEvidence'])) ||
    typeof row['alternativeBankUnavailable'] !== 'boolean'
  ) {
    return null;
  }
  const snapshotAtRaw = row['snapshotAt'];
  if (typeof snapshotAtRaw !== 'string' || snapshotAtRaw.trim().length === 0) {
    return null;
  }
  return {
    slotId: row['slotId'],
    nativeOriginalAbility: row['nativeOriginalAbility'] as RefundNativeOriginalAbility,
    settlementMode: row['settlementMode'] as RefundSettlementMode,
    payoutEvidence: row['payoutEvidence'] as RefundPayoutEvidenceKind,
    alternativeBankUnavailable: row['alternativeBankUnavailable'],
    snapshotAt: snapshotAtRaw.trim(),
  };
}

export function resolveRefundProviderSlotProfile(input: {
  readonly snapshot?: RefundProviderSlotProfileSnapshot | null;
  readonly live?: RefundProviderSlotProfile | null;
  readonly slotId?: RefundProviderSlotId | null;
  readonly providerHint?: string | null;
}): RefundProviderSlotProfile | null {
  if (input.snapshot != null) {
    return {
      slotId: input.snapshot.slotId,
      nativeOriginalAbility: input.snapshot.nativeOriginalAbility,
      settlementMode: input.snapshot.settlementMode,
      payoutEvidence: input.snapshot.payoutEvidence,
      alternativeBankUnavailable: input.snapshot.alternativeBankUnavailable,
    };
  }
  if (input.live != null) {
    return input.live;
  }
  const slot = input.slotId ?? inferRefundProviderSlotId(input.providerHint);
  if (slot == null) {
    return null;
  }
  return seedRefundProviderSlotProfile(slot);
}

export function toWritableRefundMethod(
  method: RefundReadMethod | RefundOfferedMethod,
): RefundMethod | null {
  if (method === 'ORIGINAL' || method === 'ALTERNATIVE_CASH') {
    return method;
  }
  return null;
}
