/**
 * G12 — Apply/Remove promo wire-contract parity.
 *
 * Locks shared Apply/Remove request/response shapes + §20 error codes against
 * up-backend `ErrorCodes` and `ApplyPromoCodeResponseMapper` so FE/BE cannot drift.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  PROMO_CODE_APPLY_CHANNELS,
  type ApplyPromoCodeRequest,
  type PromoCodeApplyChannel,
} from '../ApplyPromoCodeRequest.js';
import type { ApplyPromoCodeResponse } from '../ApplyPromoCodeResponse.js';
import {
  isPromoCodeErrorCode,
  PROMO_CODE_ERROR_CODES,
  type PromoCodeErrorCode,
} from '../PromoCodeErrorCode.js';
import type { RemovePromoCodeRequest } from '../RemovePromoCodeRequest.js';

/** Repo root: shared/src/promo/__tests__ → ../../../.. */
const REPO_ROOT = join(__dirname, '..', '..', '..', '..');

const BACKEND_ERROR_CODES_REL =
  'up-backend/src/shared/errors/ErrorCodes.ts';
const BACKEND_APPLY_MAPPER_REL =
  'up-backend/src/presentation/mappers/ApplyPromoCodeResponseMapper.ts';
const BACKEND_REMOVE_UC_REL =
  'up-backend/src/application/use-cases/promotions/RemoveAppliedPromoCodeUseCase.ts';
const BACKEND_PROMO_ROUTES_REL =
  'up-backend/src/presentation/routes/promotionsRoutes.ts';

/** Plan §20 Error → HTTP table — apply/remove/validate FE surface (order locked for diff noise). */
const PLAN_SECTION_20_ERROR_CODES = [
  'PROMO_CODE_INVALID',
  'PROMO_CODE_EXPIRED',
  'PROMO_CODE_EXHAUSTED',
  'PROMO_CODE_DISABLED',
  'PROMO_CODE_GUEST_REQUIRED_SIGN_IN',
  'PROMO_CODE_CHANNEL_DENIED',
  'PROMO_CODE_MIN_SPEND',
  'PROMO_CODE_ENROLLMENT_REQUIRED',
  'PROMO_BUDGET_SOFT_STOP',
  'PROMO_BUDGET_EXHAUSTED',
  'PROMO_LOYALTY_MUTUAL_EXCLUSION',
  'PROMO_CODE_HOLD_ACTIVE_REMOVE_FORBIDDEN',
  'PROMO_CODE_HOLD_ALREADY_ACTIVE',
  'PROMO_CODE_HOLD_EXPIRED',
  'PROMO_CODE_CHECKOUT_SESSION_REQUIRED',
  'PROMO_MODULE_DISABLED',
  'PROMO_TENANT_DISABLED',
  'PROMO_SHADOW_OR_DISABLED',
  'PROMO_CODE_RATE_LIMITED',
  'PROMO_CODE_EVENT_NOT_ACTIVE',
  'PROMO_CODE_ZERO_MAGNITUDE',
  'PROMO_PRICE_REVALIDATION_REQUIRED',
] as const satisfies readonly PromoCodeErrorCode[];

const APPLY_PROMO_RESPONSE_KEYS = [
  'activatedPromoRewardId',
  'eventId',
  'eventName',
  'discountAmount',
  'discountBps',
  'stackingMode',
  'activatedAt',
  'ruleVersionId',
  'source',
] as const satisfies ReadonlyArray<keyof ApplyPromoCodeResponse>;

const APPLY_PROMO_REQUEST_KEYS = [
  'checkoutSessionPublicId',
  'code',
  'channel',
] as const satisfies ReadonlyArray<keyof ApplyPromoCodeRequest>;

const REMOVE_PROMO_REQUEST_KEYS = [
  'checkoutSessionPublicId',
  'channel',
] as const satisfies ReadonlyArray<keyof RemovePromoCodeRequest>;

type AssertNever<T> = [T] extends [never] ? true : false;

type MissingResponseKey = Exclude<
  keyof ApplyPromoCodeResponse,
  (typeof APPLY_PROMO_RESPONSE_KEYS)[number]
>;
type ExtraResponseKey = Exclude<
  (typeof APPLY_PROMO_RESPONSE_KEYS)[number],
  keyof ApplyPromoCodeResponse
>;
type MissingPlanCode = Exclude<
  PromoCodeErrorCode,
  (typeof PLAN_SECTION_20_ERROR_CODES)[number]
>;
type ExtraPlanCode = Exclude<
  (typeof PLAN_SECTION_20_ERROR_CODES)[number],
  PromoCodeErrorCode
>;

const _responseKeysComplete: AssertNever<MissingResponseKey | ExtraResponseKey> = true;
const _planCodesComplete: AssertNever<MissingPlanCode | ExtraPlanCode> = true;
void _responseKeysComplete;
void _planCodesComplete;

function readRepoSource(relPath: string): string {
  const abs = join(REPO_ROOT, relPath);
  if (!existsSync(abs)) {
    throw new Error(`promo contract parity: missing ${relPath} (expected under ${REPO_ROOT})`);
  }
  return readFileSync(abs, 'utf8');
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

describe('Apply/Remove promo contract parity (G12)', () => {
  describe('shared §20 error codes', () => {
    it('PROMO_CODE_ERROR_CODES matches plan §20 apply/remove table exactly', () => {
      expect(sortedUnique(PROMO_CODE_ERROR_CODES)).toEqual(
        sortedUnique(PLAN_SECTION_20_ERROR_CODES),
      );
      expect(PROMO_CODE_ERROR_CODES).toHaveLength(PLAN_SECTION_20_ERROR_CODES.length);
    });

    it('isPromoCodeErrorCode accepts every shared code and rejects unknowns', () => {
      for (const code of PROMO_CODE_ERROR_CODES) {
        expect(isPromoCodeErrorCode(code)).toBe(true);
      }
      expect(isPromoCodeErrorCode('PROMO_DISABLED')).toBe(false);
      expect(isPromoCodeErrorCode('PROMO_CODE_ALREADY_USED')).toBe(false);
      expect(isPromoCodeErrorCode('TENANT_ENTITLEMENT_READ_DENIED')).toBe(false);
      expect(isPromoCodeErrorCode(null)).toBe(false);
      expect(isPromoCodeErrorCode(undefined)).toBe(false);
      expect(isPromoCodeErrorCode(42)).toBe(false);
    });
  });

  describe('shared request / response shapes', () => {
    it('ApplyPromoCodeResponse sample satisfies locked keys + MANUAL_CODE source', () => {
      const sample: ApplyPromoCodeResponse = {
        activatedPromoRewardId: 'reward-1',
        eventId: 'event-1',
        eventName: 'Summer deal',
        discountAmount: 15,
        discountBps: null,
        stackingMode: 'EXCLUSIVE',
        activatedAt: '2026-08-01T12:00:00.000Z',
        ruleVersionId: 'rv-1',
        source: 'MANUAL_CODE',
      };
      expect(Object.keys(sample).sort()).toEqual([...APPLY_PROMO_RESPONSE_KEYS].sort());
      expect(sample.source).toBe('MANUAL_CODE');

      const percentOnly: ApplyPromoCodeResponse = {
        ...sample,
        discountAmount: null,
        discountBps: 1500,
        stackingMode: 'STACK_PROMO_THEN_LOYALTY',
        ruleVersionId: null,
      };
      expect(percentOnly.discountAmount).toBeNull();
      expect(percentOnly.discountBps).toBe(1500);
    });

    it('ApplyPromoCodeRequest / RemovePromoCodeRequest / channels stay locked', () => {
      const applyBody: ApplyPromoCodeRequest = {
        checkoutSessionPublicId: 'sess_abc',
        code: 'TEST15',
        channel: 'CUSTOMER_CHECKOUT',
      };
      const removeBody: RemovePromoCodeRequest = {
        checkoutSessionPublicId: 'sess_abc',
        channel: 'KIOSK',
      };
      expect(Object.keys(applyBody).sort()).toEqual([...APPLY_PROMO_REQUEST_KEYS].sort());
      expect(Object.keys(removeBody).sort()).toEqual([...REMOVE_PROMO_REQUEST_KEYS].sort());
      expect([...PROMO_CODE_APPLY_CHANNELS].sort()).toEqual(
        (['CUSTOMER_CHECKOUT', 'KIOSK'] as PromoCodeApplyChannel[]).sort(),
      );
    });
  });

  describe('up-backend alignment (source parity)', () => {
    it('every shared apply/remove error code exists in ErrorCodes', () => {
      const source = readRepoSource(BACKEND_ERROR_CODES_REL);
      const missing: string[] = [];
      for (const code of PROMO_CODE_ERROR_CODES) {
        const re = new RegExp(`${code}\\s*:\\s*'${code}'`);
        if (!re.test(source)) {
          missing.push(code);
        }
      }
      expect(missing).toEqual([]);
    });

    it('ApplyPromoCodeResponseMapper assigns every shared response key', () => {
      const source = readRepoSource(BACKEND_APPLY_MAPPER_REL);
      expect(source).toMatch(/export function toApplyPromoCodeResponse/);
      expect(source).toMatch(/source:\s*'MANUAL_CODE'/);
      for (const key of APPLY_PROMO_RESPONSE_KEYS) {
        if (key === 'source') {
          continue;
        }
        const re = new RegExp(`${key}\\s*:`);
        expect(source).toMatch(re);
      }
    });

    it('RemoveAppliedPromoCodeResult remains { released: boolean }', () => {
      const source = readRepoSource(BACKEND_REMOVE_UC_REL);
      expect(source).toMatch(
        /export interface RemoveAppliedPromoCodeResult \{\s*readonly released: boolean;\s*\}/,
      );
    });

    it('promotionsRoutes maps apply via toApplyPromoCodeResponse and remove body matches shared request', () => {
      const source = readRepoSource(BACKEND_PROMO_ROUTES_REL);
      expect(source).toMatch(/toApplyPromoCodeResponse\(result\)/);
      expect(source).toMatch(/\/apply-code'/);
      expect(source).toMatch(/\/remove-code'/);
      expect(source).toMatch(/checkoutSessionPublicId/);
      expect(source).toMatch(/channel/);
      // Remove success payload is use-case result (released), not a shared apply response.
      expect(source).toMatch(/res\.json\(\{\s*success:\s*true,\s*data:\s*result\s*\}\)/);
    });
  });
});
