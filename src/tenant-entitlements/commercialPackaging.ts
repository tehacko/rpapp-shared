/**
 * Package A/C/D/E — commercial packaging map for current catalog (60 keys / v14).
 * Package C: analytics umbrella NON_COMMERCIAL; analytics_basic FREE; overview PRO;
 * explore GROWTH+DO_NOT_SELL. Package D: inventory/audit/team ops splits ALIGNED.
 * Package E: donation_recurring PRO+VALIDATE; tenant_ops_automation / restock_alerts PRO OPEN.
 * SoT v14: donation + tenant_ops_settings FREE; scheduled_pickup PRO; payment_multi_currency
 * GROWTH; bank_account_administration FREE + bank_account_providers GROWTH; receipt_delivery
 * NON_COMMERCIAL + receipt_provider_overrides GROWTH DO_NOT_SELL; shipping_light
 * SEPARATE_PRODUCT + DO_NOT_SELL (SoT §20 FUTURE MODULE / G-13 Gate 0 — outside V1A ladder).
 * staff_pickup_scan FREE (§25 SPLIT closed vs scheduled_pickup PRO). Zero REFACTOR_REQUIRED.
 * Runtime commercial projection (OFF/SHADOW/ENFORCE ceiling) is Package G — this map +
 * `evaluateCommercialPackageDecision` remain the sole packaging SSOT (no second backend map).
 */
import {
  COMMERCIAL_PLAN_IDS,
  type CommercialAlignmentStatus,
  type CommercialPackageDecision,
  type CommercialPackagingRule,
  type CommercialPlacementId,
  type CommercialPlanId,
  type EntitlementBlockKey,
  type SellabilityStatus,
} from './types.js';

const PLAN_RANK: Record<CommercialPlanId, number> = {
  FREE: 0,
  PRO: 1,
  GROWTH: 2,
};

function isSelfServePlacement(p: CommercialPlacementId): p is CommercialPlanId {
  return (COMMERCIAL_PLAN_IDS as readonly string[]).includes(p);
}

/**
 * Commercial eval plan for ALLOW/DENY (Audit A–G v1.1 Krok 0 / HSS BR-02, BR-03, INV-02, D-008).
 * Enterprise / Organization is a **separate** contract axis — it must **not** elevate
 * FREE/PRO to GROWTH for standard-plan capability evaluation. Eval plan = assigned
 * commercialPlan only. UNASSIGNED / null / undefined never invents a plan (even with Ent).
 * `enterpriseContractActive` is retained for call-site compatibility; it does not change eval.
 */
export function resolveCommercialEvaluationPlan(
  commercialPlan: CommercialPlanId | 'UNASSIGNED' | null | undefined,
  _enterpriseContractActive: boolean,
): CommercialPlanId | null {
  if (commercialPlan === 'FREE' || commercialPlan === 'PRO' || commercialPlan === 'GROWTH') {
    return commercialPlan;
  }
  return null;
}

/**
 * Ladder compare FREE &lt; PRO &lt; GROWTH. Fail-closed for UNASSIGNED / null / undefined.
 */
export function isCommercialPlanAtLeast(
  commercialPlan: CommercialPlanId | 'UNASSIGNED' | null | undefined,
  minimum: CommercialPlanId,
): boolean {
  const plan = resolveCommercialEvaluationPlan(commercialPlan, false);
  if (plan === null) {
    return false;
  }
  return PLAN_RANK[plan] >= PLAN_RANK[minimum];
}

/**
 * Pure preflight decision (Package A §3.4).
 * DEFER for REFACTOR_REQUIRED, NON_COMMERCIAL, SEPARATE_PRODUCT, DO_NOT_SELL, VALIDATE.
 * ALLOW/DENY only for ALIGNED single FREE|PRO|GROWTH vs plan ladder FREE < PRO < GROWTH.
 */
export function evaluateCommercialPackageDecision(
  plan: CommercialPlanId,
  rule: CommercialPackagingRule,
): CommercialPackageDecision {
  if (rule.alignmentStatus === 'REFACTOR_REQUIRED') {
    return 'DEFER';
  }
  if (
    rule.commercialPlacements.includes('NON_COMMERCIAL') ||
    rule.commercialPlacements.includes('SEPARATE_PRODUCT')
  ) {
    return 'DEFER';
  }
  if (rule.sellabilityStatus === 'DO_NOT_SELL' || rule.sellabilityStatus === 'VALIDATE') {
    return 'DEFER';
  }
  if (rule.commercialPlacements.length !== 1) {
    return 'DEFER';
  }
  const only = rule.commercialPlacements[0];
  if (!only || !isSelfServePlacement(only)) {
    return 'DEFER';
  }
  return PLAN_RANK[plan] >= PLAN_RANK[only] ? 'ALLOW' : 'DENY';
}

function rule(
  commercialPlacements: readonly CommercialPlacementId[],
  alignmentStatus: CommercialAlignmentStatus,
  sellabilityStatus: SellabilityStatus,
  rationale: string,
): CommercialPackagingRule {
  return { commercialPlacements, alignmentStatus, sellabilityStatus, rationale };
}

/** Complete map — every EntitlementBlockKey exactly once (compile-time `satisfies`). */
export const COMMERCIAL_PACKAGING = {
  platform_core: rule(['NON_COMMERCIAL'], 'ALIGNED', 'NOT_APPLICABLE', 'interní / invariant'),
  dev_entitlement_policy_editor: rule(
    ['NON_COMMERCIAL'],
    'ALIGNED',
    'NOT_APPLICABLE',
    'řídicí vrstva platformy',
  ),
  transactions: rule(['FREE'], 'ALIGNED', 'OPEN', 'transakční jádro'),
  sales_point_management: rule(['FREE'], 'ALIGNED', 'OPEN', 'základní správa provozovny'),
  sales_point_individual_settings: rule(
    ['NON_COMMERCIAL'],
    'ALIGNED',
    'NOT_APPLICABLE',
    'mechanismus zavádění/připravenosti; není tarif sám o sobě',
  ),
  shipping_light: rule(
    ['SEPARATE_PRODUCT'],
    'ALIGNED',
    'DO_NOT_SELL',
    'SoT §20 FUTURE MODULE / G-13 Gate 0 — Basic Shipping Light outside V1A tariff ladder; DO_NOT_SELL until Gate 0 (GROWTH is advanced carrier/orchestration above this module)',
  ),
  catalog_administration: rule(['FREE'], 'ALIGNED', 'OPEN', 'základní katalog'),
  product_barcode_administration: rule(
    ['FREE'],
    'ALIGNED',
    'OPEN',
    'základní identifikace produktu',
  ),
  audit_event_collection: rule(['NON_COMMERCIAL'], 'ALIGNED', 'NOT_APPLICABLE', 'audit invariant'),
  audit_logs_admin_ui: rule(['FREE'], 'ALIGNED', 'OPEN', 'základní audit FREE'),
  audit_intelligence: rule(['PRO'], 'ALIGNED', 'OPEN', 'pokročilá auditní inteligence PRO'),
  gdpr_consent_admin_ui: rule(
    ['NON_COMMERCIAL'],
    'ALIGNED',
    'NOT_APPLICABLE',
    'invariant soukromí',
  ),
  incident_centre_ui: rule(['PRO'], 'ALIGNED', 'OPEN', 'provozní řízení incidentů'),
  payment_processing_runtime: rule(
    ['NON_COMMERCIAL'],
    'ALIGNED',
    'NOT_APPLICABLE',
    'platební invariant',
  ),
  outbox_runtime: rule(
    ['NON_COMMERCIAL'],
    'ALIGNED',
    'NOT_APPLICABLE',
    'interní doručovací infrastruktura',
  ),
  product_vending: rule(['FREE'], 'ALIGNED', 'OPEN', 'jádro nabídky/produktu'),
  restock_alerts: rule(
    ['PRO'],
    'ALIGNED',
    'OPEN',
    'PRO AUTOMATION — vytvoření nové restock subscription; unsubscribe/one-shot zůstává core',
  ),
  donation: rule(['FREE'], 'ALIGNED', 'OPEN', 'základní darování FREE; recurring je child PRO'),
  donation_recurring: rule(
    ['PRO'],
    'ALIGNED',
    'VALIDATE',
    'PRO SECONDARY/VALIDATE — create/reactivate recurring; ne flipuje rollout/Mode2 readiness',
  ),
  inventory_management: rule(['FREE'], 'ALIGNED', 'OPEN', 'základní sklad FREE'),
  inventory_operations: rule(['PRO'], 'ALIGNED', 'OPEN', 'pokročilé skladové operace PRO'),
  inventory_incidents: rule(['PRO'], 'ALIGNED', 'OPEN', 'provozní řízení'),
  loyalty_program: rule(
    ['GROWTH'],
    'ALIGNED',
    'DO_NOT_SELL',
    'Growth / volitelný doplněk; vyžaduje běhovou a WTP bránu',
  ),
  promotions_program: rule(
    ['GROWTH'],
    'ALIGNED',
    'DO_NOT_SELL',
    'Growth / volitelný doplněk; vyžaduje běhovou a WTP bránu',
  ),
  payment_rails_strategy: rule(
    ['NON_COMMERCIAL'],
    'ALIGNED',
    'NOT_APPLICABLE',
    'strategie providerů/integrací; ne přímý tarif',
  ),
  payment_cash: rule(
    ['NON_COMMERCIAL'],
    'ALIGNED',
    'NOT_APPLICABLE',
    'FREE / invariant integrity hotovosti',
  ),
  payment_multi_currency: rule(
    ['GROWTH'],
    'ALIGNED',
    'OPEN',
    'SoT §23 — multi-currency GROWTH+',
  ),
  payment_reconciliation: rule(['FREE'], 'ALIGNED', 'OPEN', 'základní platební integrita FREE'),
  payments_hub_ui: rule(['PRO'], 'ALIGNED', 'OPEN', 'rozhraní finančního provozu'),
  stripe_integration_strategy: rule(
    ['NON_COMMERCIAL'],
    'ALIGNED',
    'NOT_APPLICABLE',
    'strategie providera',
  ),
  fulfillment_queue: rule(['FREE'], 'ALIGNED', 'OPEN', 'základní fulfillment'),
  order_pickup_infrastructure: rule(
    ['NON_COMMERCIAL'],
    'ALIGNED',
    'NOT_APPLICABLE',
    'integrita pickup flow',
  ),
  pickup_points: rule(['FREE'], 'ALIGNED', 'OPEN', 'základní lokace'),
  immediate_self_pickup: rule(['FREE'], 'ALIGNED', 'OPEN', 'základní fulfillment'),
  customer_self_collect: rule(['FREE'], 'ALIGNED', 'OPEN', 'základní fulfillment'),
  scheduled_pickup: rule(
    ['PRO'],
    'ALIGNED',
    'OPEN',
    'SoT §23 + §24 LAUNCH CORE — předobjednávka / sloty PRO+',
  ),
  staff_pickup_scan: rule(
    ['FREE'],
    'ALIGNED',
    'OPEN',
    'SoT §25 SPLIT closed — handoff integrity FREE; time-slot/capacity value on scheduled_pickup PRO; surface/kiosk readiness separate',
  ),
  surface_kiosk: rule(
    ['SEPARATE_PRODUCT'],
    'ALIGNED',
    'NOT_APPLICABLE',
    'V1B / samostatné rozhraní/surface',
  ),
  surface_customer: rule(['FREE'], 'ALIGNED', 'OPEN', 'základní zákaznické rozhraní'),
  realtime_device_transport: rule(
    ['NON_COMMERCIAL'],
    'ALIGNED',
    'NOT_APPLICABLE',
    'přenosový mechanismus',
  ),
  customer_auth_pwa: rule(['FREE'], 'ALIGNED', 'OPEN', 'základ zákaznické identity'),
  analytics: rule(
    ['NON_COMMERCIAL'],
    'ALIGNED',
    'NOT_APPLICABLE',
    'zastřešující umbrella — neprodejní; obchodní vrstvy na basic/overview/explore',
  ),
  analytics_basic: rule(
    ['FREE'],
    'ALIGNED',
    'OPEN',
    'FREE analytics shell — basic-summary / payment-mix / freshness',
  ),
  analytics_overview: rule(
    ['PRO'],
    'ALIGNED',
    'OPEN',
    'PRO / Command Center — operational summary a rozhodovací analytika',
  ),
  analytics_explore: rule(
    ['GROWTH'],
    'ALIGNED',
    'DO_NOT_SELL',
    'pokročilá/expert analytika; není startovní jádro',
  ),
  tax_management: rule(
    ['NON_COMMERCIAL'],
    'ALIGNED',
    'NOT_APPLICABLE',
    'invariant regulatorního souladu',
  ),
  compliance_fiscal_modules: rule(
    ['NON_COMMERCIAL'],
    'ALIGNED',
    'NOT_APPLICABLE',
    'invariant regulatorního souladu',
  ),
  comms_governance: rule(
    ['GROWTH'],
    'ALIGNED',
    'DO_NOT_SELL',
    'Growth/Contract; tenantem řízená správa providerů v běhu vypnutá',
  ),
  team_management_core: rule(['FREE'], 'ALIGNED', 'OPEN', 'základní životní cyklus týmu FREE'),
  permission_management_rbac: rule(
    ['GROWTH'],
    'ALIGNED',
    'OPEN',
    'pokročilé řízení přístupů Growth',
  ),
  tenant_ops_settings: rule(
    ['FREE'],
    'ALIGNED',
    'OPEN',
    'ruční provoz FREE; timed automation je child PRO',
  ),
  tenant_ops_automation: rule(
    ['PRO'],
    'ALIGNED',
    'OPEN',
    'PRO AUTOMATION / LAUNCH CORE — timed auto-return; manuální DELAY/PAUSE zůstává FREE',
  ),
  tenant_brand_kit: rule(['PRO'], 'ALIGNED', 'OPEN', 'sekundární PRO capability'),
  admin_mfa: rule(
    ['NON_COMMERCIAL'],
    'ALIGNED',
    'NOT_APPLICABLE',
    'bezpečnostní politika / readiness; nikdy ne tarifní paywall',
  ),
  admin_notifications: rule(
    ['PRO'],
    'ALIGNED',
    'OPEN',
    'sekundární PRO capability pro řízení provozní pozornosti',
  ),
  bank_account_administration: rule(
    ['FREE'],
    'ALIGNED',
    'OPEN',
    'základní bankovní CRUD FREE; multi-account/provider complexity je child GROWTH',
  ),
  bank_account_providers: rule(
    ['GROWTH'],
    'ALIGNED',
    'OPEN',
    'GROWTH multi-account / rails / attachments / provider complexity',
  ),
  receipt_delivery: rule(
    ['NON_COMMERCIAL'],
    'ALIGNED',
    'NOT_APPLICABLE',
    'základní účtenka — invariant / keep_infra',
  ),
  receipt_provider_overrides: rule(
    ['GROWTH'],
    'ALIGNED',
    'DO_NOT_SELL',
    'peer comms_governance — GROWTH provider override; not sold yet',
  ),
  bank_inbox_claims_api: rule(['FREE'], 'ALIGNED', 'OPEN', 'základní řešení platebních výjimek'),
} as const satisfies Record<EntitlementBlockKey, CommercialPackagingRule>;

export function getCommercialPackagingRule(
  blockKey: EntitlementBlockKey,
): CommercialPackagingRule {
  return COMMERCIAL_PACKAGING[blockKey];
}
