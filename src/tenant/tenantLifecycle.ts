/**
 * Tenant lifecycle / offboarding API contracts (G119).
 * Wire shapes match backend `TenantDeletePreflightResultDTO` / `TenantOffboardingResult` /
 * `TenantDeprovisioningStatusDTO` (SSOT).
 */

/** Stripe Connect preflight gate (D49) — field always present on delete-preflight. */
export type StripeConnectPreflightStatus = 'ok' | 'blocked' | 'unknown';

export interface StripeConnectPreflightInfo {
  readonly status: StripeConnectPreflightStatus;
  readonly detail: string;
}

export type TenantOffboardingMode = 'legal_closure' | 'physical_delete';

export type TenantOffboardingModeCode = 'modeA_legal_closure' | 'modeB_physical_delete';

export type OffboardingEvidenceStatusResult = 'NONE' | 'PUBLISHED' | 'FAILED';

/** Preflight blocker classification (D31 / D47) — matches backend domain union. */
export type TenantDeletePreflightBlockerClass =
  | 'statutory'
  | 'operational'
  | 'transitive'
  | 'in_flight'
  | 'compliance_dsr';

/** Restrict-14 inventory keys (D31). */
export interface TenantDeletePreflightRestrict14Counts {
  readonly PickupPoint: number;
  readonly CheckoutPaymentHandoffSession: number;
  readonly Transaction: number;
  readonly ReceiptDocument: number;
  readonly ReceiptDocumentSequence: number;
  readonly TransactionItem: number;
  readonly FiscalTransaction: number;
  readonly FiscalSequence: number;
  readonly OrderFulfillment: number;
  readonly InventoryReservation: number;
  readonly InventoryReservationCommand: number;
  readonly OpsExportJob: number;
  readonly SalesPointOrderIdempotency: number;
  readonly SalesPointCashShift: number;
}

/** G121 transitive inventory keys. */
export interface TenantDeletePreflightG121Counts {
  readonly BankInboundTransaction: number;
  readonly BankReconciliationException: number;
  readonly PaymentClaim: number;
  readonly SalesPointCashShiftIdempotency: number;
  readonly ComplianceModule: number;
  readonly PromoReward: number;
  readonly PromoRedemptionHold: number;
}

/** G124 hop keys. */
export interface TenantDeletePreflightG124Counts {
  readonly tx_to_tenant_bank_account: number;
  readonly tx_to_sales_point: number;
}

export interface TenantDeletePreflightOrphanCounts {
  readonly CustomerAuthChallenge: number;
  readonly CustomerOidcLink: number;
  readonly CustomerAuthAuditEvent: number;
  readonly SalesPointCustomerSession: number;
  readonly CustomerConsentPrompt: number;
  readonly CustomerPhysicalCard: number;
  readonly CustomerRefreshSession: number;
  readonly CustomerStepUpProof: number;
  readonly ProviderInboxLedger: number;
  readonly AdminIdempotencyRecord: number;
  readonly OutboxObligation: number;
  readonly CustomerCheckoutSession: number;
}

export interface DestructiveCascadeSummary {
  readonly adminUsers: number;
  readonly products: number;
  readonly salesPoints: number;
}

/**
 * Blocker row on GET delete-preflight (`blockers[]`).
 * Backend SSOT: `key` + `classification` (not code/class/message).
 */
export interface TenantDeletePreflightBlocker {
  readonly key: string;
  readonly count: number;
  readonly classification: TenantDeletePreflightBlockerClass;
}

/** G121 + G124 transitive Mode B blockers. */
export interface TenantDeleteTransitiveBlocker {
  readonly key: string;
  readonly count: number;
  readonly classification: 'transitive';
}

export interface DeletePreflightInFlightSummary {
  readonly openHandoffSessions: number;
  readonly openCashShifts: number;
  readonly activePaymentMonitors: number;
  readonly hasInFlight: boolean;
}

/**
 * GET /api/v1/admin/tenants/:id/delete-preflight `data` payload.
 * Mirrors backend `TenantDeletePreflightResultDTO`.
 * `canPhysicalDelete` requires Restrict-14 + G121 + G124 zeros and no in_flight.
 * `enablePermanentDelete` / `modeBAllowed` = D39 kill-switch from ILifecycleConfigPort
 * (Mode B UI/API allowed by config; inventory eligibility remains `canPhysicalDelete`).
 *
 * Not on wire (do not add): `exportJobs`, `recommendedMode`, `blockersSummary`,
 * `restrictCounts` array form — use typed maps + `blockers` instead.
 */
export interface DeletePreflightResponse {
  readonly tenantId: number;
  readonly tenantCode: string;
  readonly canPhysicalDelete: boolean;
  /** D39 kill-switch — false hides Mode B and prefer-B APIs return 403. */
  readonly enablePermanentDelete: boolean;
  /** Alias of `enablePermanentDelete` for Mode B UI gating. */
  readonly modeBAllowed: boolean;
  readonly restrict14: TenantDeletePreflightRestrict14Counts;
  /** G43: ReceiptDocumentSequence>0 with ReceiptDocument=0 is purgeable and does not block. */
  readonly emptyReceiptSequencesPurgeable: boolean;
  readonly g121: TenantDeletePreflightG121Counts;
  readonly g124: TenantDeletePreflightG124Counts;
  readonly transitiveBlockers: readonly TenantDeleteTransitiveBlocker[];
  readonly blockers: readonly TenantDeletePreflightBlocker[];
  readonly inFlight: DeletePreflightInFlightSummary;
  readonly orphans: TenantDeletePreflightOrphanCounts;
  readonly destructiveCascadeSummary: DestructiveCascadeSummary;
  readonly openDsrCount: number;
  readonly legalHoldActive: boolean;
  readonly protectedTenant: boolean;
  readonly stripeConnect: StripeConnectPreflightInfo;
}

/** Alias used by admin consumers (same wire shape). */
export type TenantDeletePreflight = DeletePreflightResponse;

/**
 * POST terminate-contract / Mode A–B offboarding result (`data` payload).
 * Mirrors backend `TenantOffboardingResult`.
 */
export interface TerminateContractResult {
  readonly mode: TenantOffboardingMode;
  readonly modeCode: TenantOffboardingModeCode;
  readonly fallbackReason?: string;
  readonly idempotent?: boolean;
  readonly deletedCustomersCount?: number;
  /** F11 / G19 / G115 — additive alias; same value as deletedCustomersCount (membership rows). */
  readonly deletedMembershipsCount?: number;
  readonly evidenceArtifact?: string;
  /** D19: Mode A always PUBLISHED | FAILED after complete. */
  readonly offboardingEvidenceStatus?: OffboardingEvidenceStatusResult;
}

// --- GET /api/v1/dev/tenants/:id/deprovisioning-status (G130) ---

export type OffboardingEvidenceStatusValue = 'NONE' | 'PUBLISHED' | 'FAILED';

export type PhysicalPurgeStatusValue =
  | 'NONE'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED_RUNTIME_ONLY'
  | 'COMPLETED'
  | 'FAILED';

export type FanOutTargetProbeStatus =
  | 'ok'
  | 'warn'
  | 'fail'
  | 'pending'
  | 'not_configured';

export type DeprovisioningCheckStatus = 'ok' | 'warn' | 'fail';

export interface DeprovisioningCheck {
  readonly id: string;
  readonly label: string;
  readonly status: DeprovisioningCheckStatus;
  readonly detail?: string;
}

export interface TenantFanOutTargetProbe {
  readonly id: string;
  readonly label: string;
  readonly status: FanOutTargetProbeStatus;
  readonly detail?: string;
}

/** Wire `data` for GET deprovisioning-status — mirrors backend TenantDeprovisioningStatusDTO. */
export interface TenantDeprovisioningStatusResponse {
  readonly tenantId: number;
  readonly tenantCode: string;
  readonly accessCutDone: boolean;
  readonly offboardingEvidenceStatus: OffboardingEvidenceStatusValue;
  readonly physicalPurgeStatus: PhysicalPurgeStatusValue;
  readonly physicalPurgeScheduledAt: string | null;
  readonly physicalPurgeEarliestAt: string | null;
  readonly inviteTokensCleared: boolean;
  readonly restrict14: Readonly<Record<string, number>>;
  readonly g121: Readonly<Record<string, number>>;
  readonly g124: Readonly<Record<string, number>>;
  readonly fanOutTargets: readonly TenantFanOutTargetProbe[];
  readonly checks: readonly DeprovisioningCheck[];
}
