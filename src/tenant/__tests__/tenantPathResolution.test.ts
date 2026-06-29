import {
  coerceRouteTenantCode,
  getTenantCodeFromPath,
  requireTenantCodeFromPath,
  TenantPathResolutionError,
  withTenantInApiPath,
} from '../tenantPathResolution.js';

describe('tenantPathResolution', () => {
  it('reads tenant from first URL segment', () => {
    expect(getTenantCodeFromPath('/railway-cafe/admin/products')).toBe('railway-cafe');
    expect(getTenantCodeFromPath('/railway-cafe/1')).toBe('railway-cafe');
    expect(getTenantCodeFromPath('/acme/sign-in')).toBe('acme');
  });

  it('returns null for dev/admin/api prefixes', () => {
    expect(getTenantCodeFromPath('/dev/login')).toBeNull();
    expect(getTenantCodeFromPath('/admin/login')).toBeNull();
    expect(getTenantCodeFromPath('/api/v1/foo')).toBeNull();
  });

  it('requires tenant in path', () => {
    expect(() => requireTenantCodeFromPath('/dev/dashboard')).toThrow(TenantPathResolutionError);
    expect(requireTenantCodeFromPath('/railway-cafe/shop')).toBe('railway-cafe');
  });

  it('coerces route param without default fallback', () => {
    expect(coerceRouteTenantCode('railway-cafe')).toBe('railway-cafe');
    expect(() => coerceRouteTenantCode(undefined)).toThrow(TenantPathResolutionError);
    expect(() => coerceRouteTenantCode('  ')).toThrow(TenantPathResolutionError);
  });

  it('prefixes API paths with tenant', () => {
    expect(withTenantInApiPath('/api/admin/products', 'railway-cafe')).toBe(
      '/api/railway-cafe/admin/products',
    );
    expect(withTenantInApiPath('/api/v1/products', 'railway-cafe')).toBe(
      '/api/railway-cafe/v1/products',
    );
  });
});
