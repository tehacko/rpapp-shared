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

  it('returns null for dev/admin/api/tenants/register/legal prefixes', () => {
    expect(getTenantCodeFromPath('/dev/login')).toBeNull();
    expect(getTenantCodeFromPath('/admin/login')).toBeNull();
    expect(getTenantCodeFromPath('/api/v1/foo')).toBeNull();
    expect(getTenantCodeFromPath('/tenants')).toBeNull();
    expect(getTenantCodeFromPath('/tenants/')).toBeNull();
    expect(getTenantCodeFromPath('/register')).toBeNull();
    expect(getTenantCodeFromPath('/legal')).toBeNull();
    expect(getTenantCodeFromPath('/legal/terms')).toBeNull();
    expect(getTenantCodeFromPath('/legal/privacy')).toBeNull();
    expect(getTenantCodeFromPath('/LEGAL/terms')).toBeNull();
  });

  it('keeps real tenant codes and account paths under tenant', () => {
    expect(getTenantCodeFromPath('/railway-cafe/account/organization')).toBe('railway-cafe');
    expect(getTenantCodeFromPath('/acme/account/organization/billing')).toBe('acme');
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
