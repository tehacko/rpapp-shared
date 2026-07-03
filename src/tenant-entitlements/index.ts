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
