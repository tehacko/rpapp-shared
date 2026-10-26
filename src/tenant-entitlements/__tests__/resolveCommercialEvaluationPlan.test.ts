import {
  evaluateCommercialPackageDecision,
  getCommercialPackagingRule,
  resolveCommercialEvaluationPlan,
} from '../index.js';

describe('resolveCommercialEvaluationPlan (Audit A-G v1.1 Krok 0 — Ent ≠ GROWTH)', () => {
  it('returns assigned plan unchanged when Enterprise is inactive', () => {
    expect(resolveCommercialEvaluationPlan('FREE', false)).toBe('FREE');
    expect(resolveCommercialEvaluationPlan('PRO', false)).toBe('PRO');
    expect(resolveCommercialEvaluationPlan('GROWTH', false)).toBe('GROWTH');
  });

  it('FREE+Enterprise eval=FREE; PRO+Enterprise eval=PRO; GROWTH+Enterprise=GROWTH', () => {
    expect(resolveCommercialEvaluationPlan('FREE', true)).toBe('FREE');
    expect(resolveCommercialEvaluationPlan('PRO', true)).toBe('PRO');
    expect(resolveCommercialEvaluationPlan('GROWTH', true)).toBe('GROWTH');
  });

  it('does not invent a plan for UNASSIGNED / null / undefined even with Enterprise', () => {
    expect(resolveCommercialEvaluationPlan(null, true)).toBeNull();
    expect(resolveCommercialEvaluationPlan(undefined, true)).toBeNull();
    expect(resolveCommercialEvaluationPlan('UNASSIGNED', true)).toBeNull();
    expect(resolveCommercialEvaluationPlan(null, false)).toBeNull();
    expect(resolveCommercialEvaluationPlan('UNASSIGNED', false)).toBeNull();
  });

  it('Ent+FREE keeps FREE ladder (payments_hub_ui DENY)', () => {
    const evalPlan = resolveCommercialEvaluationPlan('FREE', true);
    expect(evalPlan).toBe('FREE');
    expect(
      evaluateCommercialPackageDecision(evalPlan!, getCommercialPackagingRule('payments_hub_ui')),
    ).toBe('DENY');
  });

  it('DEFER paths stay DEFER under Ent+PRO (DO_NOT_SELL / NON_COMMERCIAL)', () => {
    const evalPlan = resolveCommercialEvaluationPlan('PRO', true);
    expect(evalPlan).toBe('PRO');
    expect(
      evaluateCommercialPackageDecision(evalPlan!, getCommercialPackagingRule('loyalty_program')),
    ).toBe('DEFER');
    expect(
      evaluateCommercialPackageDecision(evalPlan!, getCommercialPackagingRule('platform_core')),
    ).toBe('DEFER');
  });
});
