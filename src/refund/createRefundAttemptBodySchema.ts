/**
 * Shared runtime create-refund / alternative-refund body schemas (G19 / P0-08).
 *
 * Single Zod SSOT for Admin + Pickup serializers and backend validators.
 * No client `businessBasis`. `productNameSnapshot` is optional on the wire
 * (server-derived) — clients must omit it via serializers.
 */
import { z } from 'zod';
import { REFUND_METHODS, REFUND_STAFF_REASONS } from './refundContracts.js';

const refundLineSchema = z
  .object({
    productId: z.number().int().positive(),
    variantId: z.number().int().positive().nullable().optional(),
    quantity: z.number().int().positive(),
    amount: z.number().positive().finite(),
    /** Optional — server derives from TransactionItem / Product (P0-08). */
    productNameSnapshot: z.string().min(1).max(255).optional(),
  })
  .strict();

export const createRefundAttemptBodySchema = z
  .object({
    transactionId: z.number().int().positive(),
    amount: z.number().positive().finite(),
    currency: z.string().length(3),
    staffReason: z.enum(REFUND_STAFF_REASONS),
    /** Write SSOT: ORIGINAL | ALTERNATIVE_CASH only — ALTERNATIVE_BANK rejected at schema. */
    method: z.enum(REFUND_METHODS).optional(),
    lines: z.array(refundLineSchema).min(1),
    note: z.string().max(2000).nullable().optional(),
    complaintCaseId: z.string().uuid().nullable().optional(),
  })
  .strict();

export type CreateRefundAttemptBody = z.infer<typeof createRefundAttemptBodySchema>;

export const alternativeRefundBodySchema = z
  .object({
    transactionId: z.number().int().positive(),
    amount: z.number().positive().finite(),
    currency: z.string().length(3),
    staffReason: z.enum(REFUND_STAFF_REASONS),
    /** Alternative write SSOT: ALTERNATIVE_CASH only — ALTERNATIVE_BANK rejected at schema. */
    method: z.literal('ALTERNATIVE_CASH'),
    lines: z.array(refundLineSchema).min(1),
    note: z.string().max(2000).nullable().optional(),
    customerConsentToAltMethodAt: z.string().datetime().nullable().optional(),
    alternativeDestinationJson: z.record(z.string(), z.unknown()).nullable().optional(),
    transitionReason: z.string().min(1).max(2000).nullable().optional(),
  })
  .strict();

export type AlternativeRefundBody = z.infer<typeof alternativeRefundBodySchema>;

/** Strip client snapshot / staff-only fields into Zod-canonical create body. */
export function serializeCreateRefundAttemptBody(
  input: CreateRefundAttemptBody | Record<string, unknown>,
): CreateRefundAttemptBody {
  const candidate = {
    transactionId: (input as CreateRefundAttemptBody).transactionId,
    amount: (input as CreateRefundAttemptBody).amount,
    currency: (input as CreateRefundAttemptBody).currency,
    staffReason: (input as CreateRefundAttemptBody).staffReason,
    lines: ((input as CreateRefundAttemptBody).lines ?? []).map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
      amount: line.amount,
      ...(line.variantId !== undefined ? { variantId: line.variantId ?? null } : {}),
    })),
    ...((input as CreateRefundAttemptBody).note !== undefined
      ? { note: (input as CreateRefundAttemptBody).note }
      : {}),
    ...((input as CreateRefundAttemptBody).complaintCaseId !== undefined
      ? { complaintCaseId: (input as CreateRefundAttemptBody).complaintCaseId }
      : {}),
    ...((input as CreateRefundAttemptBody).method !== undefined
      ? { method: (input as CreateRefundAttemptBody).method }
      : {}),
  };
  const parsed = createRefundAttemptBodySchema.safeParse(candidate);
  if (!parsed.success) {
    throw new Error(
      `Invalid create-refund body: ${parsed.error.issues.map((i) => i.message).join('; ')}`,
    );
  }
  return parsed.data;
}

/** Strip client snapshot into Zod-canonical alternative body (G20). */
export function serializeAlternativeRefundBody(
  input: AlternativeRefundBody | Record<string, unknown>,
): AlternativeRefundBody {
  const raw = input as AlternativeRefundBody;
  const candidate = {
    transactionId: raw.transactionId,
    amount: raw.amount,
    currency: raw.currency,
    staffReason: raw.staffReason,
    method: raw.method,
    lines: (raw.lines ?? []).map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
      amount: line.amount,
      ...(line.variantId !== undefined ? { variantId: line.variantId ?? null } : {}),
    })),
    ...(raw.note !== undefined ? { note: raw.note } : {}),
    ...(raw.customerConsentToAltMethodAt !== undefined
      ? { customerConsentToAltMethodAt: raw.customerConsentToAltMethodAt }
      : {}),
    ...(raw.alternativeDestinationJson !== undefined
      ? { alternativeDestinationJson: raw.alternativeDestinationJson }
      : {}),
    ...(raw.transitionReason !== undefined ? { transitionReason: raw.transitionReason } : {}),
  };
  const parsed = alternativeRefundBodySchema.safeParse(candidate);
  if (!parsed.success) {
    throw new Error(
      `Invalid alternative-refund body: ${parsed.error.issues.map((i) => i.message).join('; ')}`,
    );
  }
  return parsed.data;
}
