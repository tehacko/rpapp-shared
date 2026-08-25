import {
  brandingSignedMediaIdentity,
  preferStableBrandingMediaUrl,
} from '../branding/signedMediaUrlStability.js';

describe('brandingSignedMediaIdentity', () => {
  it('strips sig and exp while keeping galleryVersion and path', () => {
    const a =
      'https://api.example/api/v1/tenants/1/logo/thumbnail?sig=aaa&exp=100&tenantId=1&galleryVersion=2&audience=customer';
    const b =
      'https://api.example/api/v1/tenants/1/logo/thumbnail?exp=999&sig=bbb&tenantId=1&galleryVersion=2&audience=customer';
    expect(brandingSignedMediaIdentity(a)).toBe(brandingSignedMediaIdentity(b));
    expect(brandingSignedMediaIdentity(a)).toContain('galleryVersion=2');
    expect(brandingSignedMediaIdentity(a)).not.toContain('sig=');
    expect(brandingSignedMediaIdentity(a)).not.toContain('exp=');
  });

  it('changes when galleryVersion changes', () => {
    const v1 =
      '/api/v1/tenants/1/logo?sig=a&exp=1&galleryVersion=1&tenantId=1';
    const v2 =
      '/api/v1/tenants/1/logo?sig=b&exp=2&galleryVersion=2&tenantId=1';
    expect(brandingSignedMediaIdentity(v1)).not.toBe(brandingSignedMediaIdentity(v2));
  });

  it('returns null for empty', () => {
    expect(brandingSignedMediaIdentity(null)).toBeNull();
    expect(brandingSignedMediaIdentity('  ')).toBeNull();
  });
});

describe('preferStableBrandingMediaUrl', () => {
  it('keeps previous URL when only sig/exp change', () => {
    const prev =
      'https://api.example/logo?sig=old&exp=1&galleryVersion=3&tenantId=9';
    const next =
      'https://api.example/logo?sig=new&exp=99&galleryVersion=3&tenantId=9';
    expect(preferStableBrandingMediaUrl(prev, next)).toBe(prev);
  });

  it('takes next when galleryVersion changes', () => {
    const prev =
      'https://api.example/logo?sig=old&exp=1&galleryVersion=3&tenantId=9';
    const next =
      'https://api.example/logo?sig=new&exp=99&galleryVersion=4&tenantId=9';
    expect(preferStableBrandingMediaUrl(prev, next)).toBe(next);
  });

  it('clears when next is null', () => {
    expect(preferStableBrandingMediaUrl('https://api.example/logo?sig=a', null)).toBeNull();
  });
});
