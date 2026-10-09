/**
 * Canonical goodwill / MarkRefund HTTP write body (Admin + Pickup).
 * Labels and salesPointId are server-derived — clients must not send them.
 * Write method SSOT: ORIGINAL | ALTERNATIVE_CASH only — ALTERNATIVE_BANK rejected here.
 * Backend domain fail-closed for BANK remains HTTP 403 (do not change to 409).
 */

export const GOODWILL_REFUND_WRITE_FORBIDDEN_KEYS = [
  'productNameSnapshot',
  'businessBasis',
  'salesPointId',
] as const;

const ALLOWED_KEYS = new Set([
  'transactionId',
  'reference',
  'note',
  'refundAmount',
  'refundPayoutRail',
  'method',
  'sourceAttemptStatus',
  'customerConsentToAltMethodAt',
  'cashContext',
  'personalActor',
]);

export interface GoodwillRefundWriteBody {
  readonly transactionId: number;
  readonly reference?: string;
  readonly note?: string;
  readonly refundAmount?: number;
  readonly refundPayoutRail?: string;
  readonly method?: string;
  readonly sourceAttemptStatus?: string;
  readonly customerConsentToAltMethodAt?: string;
  readonly cashContext?: boolean;
  readonly personalActor?: boolean;
}

export interface BuildGoodwillRefundWriteInput {
  readonly transactionId: number;
  readonly note?: string;
  readonly reference?: string;
  readonly refundAmount?: number;
  readonly refundPayoutRail?: string;
  readonly method?: string;
  readonly sourceAttemptStatus?: string;
  readonly customerConsentToAltMethodAt?: string;
  readonly cashContext?: boolean;
  readonly personalActor?: boolean;
}

function optionalTrimmedString(value: unknown, max: number): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new Error('INVALID_GOODWILL_REFUND_BODY');
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }
  if (trimmed.length > max) {
    throw new Error('INVALID_GOODWILL_REFUND_BODY');
  }
  return trimmed;
}

const GOODWILL_WRITE_METHODS = new Set(['ORIGINAL', 'ALTERNATIVE_CASH']);

/**
 * Serialize the Admin/Pickup write body. Does not include alternative-rail pickers.
 */
export function buildGoodwillRefundWriteBody(input: BuildGoodwillRefundWriteInput): GoodwillRefundWriteBody {
  if (!Number.isInteger(input.transactionId) || input.transactionId <= 0) {
    throw new Error('INVALID_TRANSACTION_ID');
  }
  const body: GoodwillRefundWriteBody = { transactionId: input.transactionId };
  const note = optionalTrimmedString(input.note, 500);
  const reference = optionalTrimmedString(input.reference, 255);
  const refundPayoutRail = optionalTrimmedString(input.refundPayoutRail, 64);
  const method = optionalTrimmedString(input.method, 64);
  if (method !== undefined && !GOODWILL_WRITE_METHODS.has(method)) {
    throw new Error('INVALID_GOODWILL_REFUND_BODY');
  }
  const sourceAttemptStatus = optionalTrimmedString(input.sourceAttemptStatus, 64);
  const customerConsentToAltMethodAt = optionalTrimmedString(input.customerConsentToAltMethodAt, 64);
  return {
    ...body,
    ...(note !== undefined ? { note } : {}),
    ...(reference !== undefined ? { reference } : {}),
    ...(input.refundAmount !== undefined ? { refundAmount: input.refundAmount } : {}),
    ...(refundPayoutRail !== undefined ? { refundPayoutRail } : {}),
    ...(method !== undefined ? { method } : {}),
    ...(sourceAttemptStatus !== undefined ? { sourceAttemptStatus } : {}),
    ...(customerConsentToAltMethodAt !== undefined ? { customerConsentToAltMethodAt } : {}),
    ...(input.cashContext !== undefined ? { cashContext: input.cashContext } : {}),
    ...(input.personalActor !== undefined ? { personalActor: input.personalActor } : {}),
  };
}

/**
 * Strict runtime parse matching backend goodwillRefundSchema field set
 * (same contract the HTTP Zod schema validates). Rejects ALTERNATIVE_BANK.
 */
export function parseGoodwillRefundWriteBody(input: unknown): GoodwillRefundWriteBody {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('INVALID_GOODWILL_REFUND_BODY');
  }
  const rec = input as Record<string, unknown>;
  for (const key of Object.keys(rec)) {
    if (!ALLOWED_KEYS.has(key)) {
      throw new Error('CLIENT_AUTHORITATIVE_FIELD_FORBIDDEN');
    }
  }
  for (const forbidden of GOODWILL_REFUND_WRITE_FORBIDDEN_KEYS) {
    if (forbidden in rec) {
      throw new Error('CLIENT_AUTHORITATIVE_FIELD_FORBIDDEN');
    }
  }
  if (typeof rec.transactionId !== 'number' || !Number.isInteger(rec.transactionId) || rec.transactionId <= 0) {
    throw new Error('INVALID_TRANSACTION_ID');
  }
  if (rec.refundAmount !== undefined) {
    if (typeof rec.refundAmount !== 'number' || !Number.isFinite(rec.refundAmount) || rec.refundAmount <= 0) {
      throw new Error('INVALID_GOODWILL_REFUND_BODY');
    }
  }
  if (rec.cashContext !== undefined && typeof rec.cashContext !== 'boolean') {
    throw new Error('INVALID_GOODWILL_REFUND_BODY');
  }
  if (rec.personalActor !== undefined && typeof rec.personalActor !== 'boolean') {
    throw new Error('INVALID_GOODWILL_REFUND_BODY');
  }
  if (rec.method !== undefined) {
    if (typeof rec.method !== 'string' || !GOODWILL_WRITE_METHODS.has(rec.method)) {
      throw new Error('INVALID_GOODWILL_REFUND_BODY');
    }
  }
  return buildGoodwillRefundWriteBody({
    transactionId: rec.transactionId,
    note: typeof rec.note === 'string' ? rec.note : undefined,
    reference: typeof rec.reference === 'string' ? rec.reference : undefined,
    refundAmount: rec.refundAmount,
    refundPayoutRail: typeof rec.refundPayoutRail === 'string' ? rec.refundPayoutRail : undefined,
    method: typeof rec.method === 'string' ? rec.method : undefined,
    sourceAttemptStatus: typeof rec.sourceAttemptStatus === 'string' ? rec.sourceAttemptStatus : undefined,
    customerConsentToAltMethodAt:
      typeof rec.customerConsentToAltMethodAt === 'string' ? rec.customerConsentToAltMethodAt : undefined,
    cashContext: rec.cashContext,
    personalActor: rec.personalActor,
  });
}
