// @analytics-negative-migration
import {
  ANALYTICS_EMITTER_BE_REFERENCE_PATHS,
  ANALYTICS_EMITTER_FE_REFERENCE_PATHS,
  ANALYTICS_EMITTER_MANIFEST,
  validateAnalyticsEmitterManifest,
} from '../analyticsEmitterManifest.js';

describe('analyticsEmitterManifest', () => {
  it('is non-empty and passes validation', () => {
    expect(ANALYTICS_EMITTER_MANIFEST.length).toBeGreaterThan(0);
    expect(validateAnalyticsEmitterManifest()).toEqual([]);
  });

  it('maps every FE manifest reference to a repo path', () => {
    const feRefs = new Set(
      ANALYTICS_EMITTER_MANIFEST.filter((cell) => cell.layer === 'FE').map(
        (cell) => cell.reference
      )
    );

    for (const reference of feRefs) {
      expect(ANALYTICS_EMITTER_FE_REFERENCE_PATHS[reference]).toBeDefined();
    }
  });

  it('maps every BE manifest reference to a repo path', () => {
    const beRefs = new Set(
      ANALYTICS_EMITTER_MANIFEST.filter((cell) => cell.layer === 'BE').map(
        (cell) => cell.reference
      )
    );

    for (const reference of beRefs) {
      expect(ANALYTICS_EMITTER_BE_REFERENCE_PATHS[reference]).toBeDefined();
    }
  });

  describe('phase 4 P0/P1 gap slice (grep-verified emit paths)', () => {
    const p0GapEvents = [
      'identity_created',
      'checkout_handoff_created',
      'account_logged_in',
      'product_barcode_lookup_hit',
      'product_barcode_lookup_miss',
      'product_barcode_assigned',
      'product_barcode_cleared',
      'product_barcode_alt_added',
      'product_barcode_alt_removed',
      'product_barcode_alt_promoted',
      'product_barcode_assign_conflict',
      'consent_banner_dismissed',
      'session_recovered',
      'qr_regenerated',
    ] as const;

    it.each(p0GapEvents)('%s has at least one required manifest cell', (eventName) => {
      const cells = ANALYTICS_EMITTER_MANIFEST.filter(
        (cell) => cell.eventName === eventName && cell.required,
      );
      expect(cells.length).toBeGreaterThan(0);
    });

    it('account_logged_in wires both password and OTP server emitters', () => {
      const references = ANALYTICS_EMITTER_MANIFEST.filter(
        (cell) => cell.eventName === 'account_logged_in' && cell.layer === 'BE',
      ).map((cell) => cell.reference);
      expect(references).toEqual(
        expect.arrayContaining(['LoginCustomerWithPasswordUseCase', 'VerifyCustomerOtpUseCase']),
      );
    });

    // Negative migration test: login_success is a legacy denylist name — must stay absent
    // from the emitter manifest (canonical replacement: account_logged_in).
    it('negative migration: does not list stale login_success server cell', () => {
      expect(
        ANALYTICS_EMITTER_MANIFEST.some((cell) => cell.eventName === 'login_success'),
      ).toBe(false);
    });

    const p1NavEvents = [
      'cta_clicked',
      'back_clicked',
      'error_shown',
      'product_removed',
      'cart_viewed',
    ] as const;

    it.each(p1NavEvents)('%s has customer and kiosk FE manifest cells', (eventName) => {
      const customer = ANALYTICS_EMITTER_MANIFEST.filter(
        (cell) =>
          cell.eventName === eventName && cell.surface === 'customer' && cell.layer === 'FE' && cell.required,
      );
      const kiosk = ANALYTICS_EMITTER_MANIFEST.filter(
        (cell) =>
          cell.eventName === eventName && cell.surface === 'kiosk' && cell.layer === 'FE' && cell.required,
      );
      expect(customer.length).toBeGreaterThan(0);
      expect(kiosk.length).toBeGreaterThan(0);
    });

    it('payment_failed is server-emitted only (no FE manifest cells)', () => {
      const feCells = ANALYTICS_EMITTER_MANIFEST.filter(
        (cell) => cell.eventName === 'payment_failed' && cell.layer === 'FE',
      );
      const beCells = ANALYTICS_EMITTER_MANIFEST.filter(
        (cell) => cell.eventName === 'payment_failed' && cell.layer === 'BE' && cell.required,
      );
      expect(feCells).toHaveLength(0);
      expect(beCells.length).toBeGreaterThan(0);
      expect(beCells.map((cell) => cell.reference)).toContain('CancelIntentUseCase');
    });
  });

  describe('G-P1-12 extension events (manifest slice)', () => {
    const pwaEvents = [
      'pwa_install_accepted',
      'pwa_install_dismissed',
      'pwa_update_shown',
      'pwa_update_deferred',
      'pwa_update_applied',
    ] as const;

    it.each(pwaEvents)('%s has required customer FE PwaLifecycle cell', (eventName) => {
      const cells = ANALYTICS_EMITTER_MANIFEST.filter(
        (cell) =>
          cell.eventName === eventName &&
          cell.surface === 'customer' &&
          cell.layer === 'FE' &&
          cell.required &&
          cell.reference === 'PwaLifecycle',
      );
      expect(cells).toHaveLength(1);
    });

    const promoBeEvents = [
      'promo_preview_evaluated',
      'promo_reward_activated',
      'promo_reward_redeemed',
      'promo_reward_rolled_back',
      'promo_progress_threshold_reached',
      'promo_stacking_rejected',
      'promo_budget_soft_stop',
      'promo_budget_exhausted',
      'promo_code_rejected',
      'promo_code_applied',
      'promo_code_removed',
      'promo_code_redeemed',
      'promo_code_released',
    ] as const;

    it.each(promoBeEvents)('%s has required server BE manifest cell', (eventName) => {
      const cells = ANALYTICS_EMITTER_MANIFEST.filter(
        (cell) => cell.eventName === eventName && cell.layer === 'BE' && cell.required,
      );
      expect(cells.length).toBeGreaterThan(0);
    });

    const donationDeferredFeEvents = [
      'donation_impact_opened',
      'donation_tax_receipt_selected',
      'recurring_donation_selected',
      'donation_abandoned',
    ] as const;

    it.each(donationDeferredFeEvents)(
      '%s has required customer FE donationAnalyticsMetadata cell',
      (eventName) => {
        const cells = ANALYTICS_EMITTER_MANIFEST.filter(
          (cell) =>
            cell.eventName === eventName &&
            cell.surface === 'customer' &&
            cell.layer === 'FE' &&
            cell.required &&
            cell.reference === 'donationAnalyticsMetadata',
        );
        expect(cells).toHaveLength(1);
      },
    );

    const kioskDeferredFeEvents = ['payment_submitted', 'retail_order_abandoned'] as const;

    it.each(kioskDeferredFeEvents)(
      '%s has required kiosk FE kioskPaymentFlowHandlers cell',
      (eventName) => {
        const cells = ANALYTICS_EMITTER_MANIFEST.filter(
          (cell) =>
            cell.eventName === eventName &&
            cell.surface === 'kiosk' &&
            cell.layer === 'FE' &&
            cell.required &&
            cell.reference === 'kioskPaymentFlowHandlers',
        );
        expect(cells).toHaveLength(1);
      },
    );
  });
});
