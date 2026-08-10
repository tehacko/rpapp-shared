export {
  TENANT_ENTITLEMENT_BLOCK_CATALOG,
  TENANT_ENTITLEMENT_CATALOG_VERSION,
  TENANT_ENTITLEMENT_BLOCK_COUNT,
  ENTITLEMENT_BLOCK_KEYS,
  getEntitlementBlockCatalogEntry,
  isEntitlementBlockKey,
} from './catalog.js';

export {
  ENTITLEMENT_BLOCK_CLASSES,
  ENTITLEMENT_MUTATION_MODES,
  ENTITLEMENT_PARENT_OPERATORS,
  ENTITLEMENT_RUNTIME_MODES,
  ENTITLEMENT_VISIBILITY_MODES,
  RECONCILIATION_MODES,
  SIMPLE_ENTITLEMENT_STATES,
  TENANT_SURFACE_PRESET_IDS,
  simpleEntitlementStateToAxes,
} from './types.js';

export { applySimpleStateDependencyImplications } from './applySimpleStateDependencyImplications.js';

export {
  applyCatalogParentDenialImplications,
  areEntitlementBlockParentsSatisfied,
  areEntitlementBlockParentsSatisfiedBy,
  isEntitlementParentRuntimeActive,
} from './catalogParentSatisfaction.js';

export {
  PICKUP_OPERATIONS_CLUSTER_BLOCK_KEYS,
  PICKUP_OPERATIONS_CLUSTER_LEADER,
  applyPickupOperationsClusterSync,
  isPickupOperationsClusterBlock,
  isPickupOperationsClusterFollower,
} from './pickupOperationsCluster.js';

export {
  TENANT_ALLOWED_PURPOSES,
  TENANT_SURFACE_SCOPE_IDS,
  isTenantAllowedPurposes,
  isTenantSurfaceScope,
} from './tenantScopeTypes.js';

export type { TenantAllowedPurposes, TenantSurfaceScope } from './tenantScopeTypes.js';

export {
  isBankAccountAllowedPurposesCompatible,
  isBankAccountPurposeSelectable,
  isDonationPurposeAllowed,
  isProductPurposeAllowed,
  resolveBankAccountAllowedPurposes,
  shouldClearTenantDefaultDonationProjectId,
  shouldShowBankAccountPurposeSection,
  shouldSyncBankAccountsToTenantAllowedPurposes,
} from './bankAccountPurposeScope.js';

export {
  TENANT_AXIS_CONTROLLED_BLOCK_KEYS,
  TENANT_PRODUCT_PURPOSE_LOCKED_BLOCK_KEYS,
  TENANT_PURPOSE_AXIS_BLOCK_KEYS,
  TENANT_SURFACE_AXIS_BLOCK_KEYS,
  applyTenantScopeToSimpleStates,
  buildDefaultTenantScopeBaseline,
  inferAllowedPurposesFromSimpleStates,
  inferSurfaceScopeFromSimpleStates,
  isAxisControlledEntitlementBlock,
  isProductCommerceAllowed,
  isRuntimeActiveSimpleEntitlementState,
  isTenantScopeLockedBlock,
  stripAxisControlledSimpleStates,
} from './applyTenantScopeToSimpleStates.js';

export type {
  TenantAxisControlledBlockKey,
  TenantProductPurposeLockedBlockKey,
} from './applyTenantScopeToSimpleStates.js';

export {
  axesToSimpleState,
  resolveSimpleStateForBlock,
  simpleStatesFromPolicyAxes,
} from './entitlementSimpleStateMapping.js';

export type {
  EntitlementBlockAxes,
  EntitlementBlockCatalogEntry,
  EntitlementBlockClass,
  EntitlementBlockKey,
  EntitlementMutationMode,
  EntitlementParentOperator,
  EntitlementRuntimeMode,
  EntitlementStrategyJson,
  EntitlementVisibilityMode,
  EvaluatedEntitlementPosture,
  PaymentReconciliationStrategy,
  ReconciliationMode,
  SimpleEntitlementState,
  StripeIntegrationStrategy,
  TenantSurfacePresetId,
} from './types.js';

export {
  allowReadsForMutationMode,
  allowWritesForMutationMode,
  evaluatePosture,
  isEntitlementVisible,
  isVisibleForVisibilityMode,
} from './evaluatePosture.js';

export {
  PAYMENT_CASH_BLOCK_KEY,
  PAYMENT_CARD_PRESENT_RESERVED_KEY,
  canCashContributeToPayReady,
  isPaymentCashAxesEntitled,
  isPaymentCashEntitledFromChecker,
  isPaymentCashRuntimeModeActive,
} from './paymentCashEntitlement.js';

export {
  evaluateNavEntitlement,
  evaluateNavEntitlementFromVisible,
} from './evaluateNavEntitlement.js';

export type {
  EvaluateNavEntitlementFromVisibleInput,
  EvaluateNavEntitlementInput,
} from './evaluateNavEntitlement.js';

export {
  resolveSalesPointEntitlementCeiling,
  DEFAULT_ENTITLED_PUBLIC_POSTURE,
  ENTITLEMENT_SURFACE_DISABLED_CODE,
} from '../sales-point/salesPointPublicConfig.js';

export type {
  SalesPointPublicEntitlementBlockPosture,
  SalesPointPublicEntitlementCeiling,
} from '../sales-point/salesPointPublicConfig.js';
