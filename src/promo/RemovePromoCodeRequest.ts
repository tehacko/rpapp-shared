/**
 * POST /api/v1/promotions/remove-code body (plan §5.2).
 */

import type { PromoCodeApplyChannel } from './ApplyPromoCodeRequest.js';

export interface RemovePromoCodeRequest {
  readonly checkoutSessionPublicId: string;
  readonly channel: PromoCodeApplyChannel;
}
