import {
  evaluateCommercialPackageDecision,
  getCommercialPackagingRule,
  resolveCommercialEvaluationPlan,
} from '../index.js';

describe('resolveCommercialEvaluationPlan (G2 Enterprise commercial eval)', () => {
  it('returns assigned plan unchanged when Enterprise is inactive', () => {
    expect(resolveCommercialEvaluationPlan('FREE', false)).toBe('FREE');
    expect(resolveCommercialEvaluationPlan('PRO', false)).toBe('PRO');
    expect(resolveCommercialEvaluationPlan('GROWTH', false)).toBe('GROWTH');
  });

  it('maps Ent + assigned plan to GROWTH for ALLOW/DENY evaluation', () => {
    expect(resolveCommercialEvaluationPlan('FREE', true)).toBe('GROWTH');
    expect(resolveCommercialEvaluationPlan('PRO', true)).toBe('GROWTH');
    expect(resolveCommercialEvaluationPlan('GROWTH', true)).toBe('GROWTH');
  });

  it('does not invent a plan for UNASSIGNED / null / undefined even with Enterprise', () => {
    expect(resolveCommercialEvaluationPlan(null, true)).toBeNull();
    expect(resolveCommercialEvaluationPlan(undefined, true)).toBeNull();
    expect(resolveCommercialEvaluationPlan('UNASSIGNED', true)).toBeNull();
    expect(resolveCommercialEvaluationPlan(null, false)).toBeNull();
    expect(resolveCommercialEvaluationPlan('UNASSIGNED', false)).toBeNull();
  });

  it('Ent+FREE evaluation uses GROWTH ladder (payments_hub_ui ALLOW)', () => {
    const evalPlan = resolveCommercialEvaluationPlan('FREE', true);
    expect(evalPlan).toBe('GROWTH');
    expect(
      evaluateCommercialPackageDecision(evalPlan!, getCommercialPackagingRule('payments_hub_ui')),
    ).toBe('ALLOW');
    expect(
      evaluateCommercialPackageDecision('FREE', getCommercialPackagingRule('payments_hub_ui')),
    ).toBe('DENY');
  });

  it('DEFER paths stay DEFER under Ent->GROWTH (DO_NOT_SELL / NON_COMMERCIAL)', () => {
    const evalPlan = resolveCommercialEvaluationPlan('PRO', true);
    expect(evalPlan).toBe('GROWTH');
    expect(
      evaluateCommercialPackageDecision(evalPlan!, getCommercialPackagingRule('loyalty_program')),
    ).toBe('DEFER');
    expect(
      evaluateCommercialPackageDecision(evalPlan!, getCommercialPackagingRule('platform_core')),
    ).toBe('DEFER');
  });
});
