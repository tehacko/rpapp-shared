/**
 * Keys-only SSOT for log metadata redaction.
 *
 * Backend imports {@link SHARED_SENSITIVE_META_KEYS} only — never OTP field `code`
 * (domain `code` / `errorCode` are legitimate API fields in Railway JSON).
 * Client merges {@link CLIENT_ONLY_SENSITIVE_META_KEYS} on top.
 */

/** Shared deny-list keys (FE + BE). Does NOT include OTP `code`. */
export const SHARED_SENSITIVE_META_KEYS = [
  'apitoken',
  'apiToken',
  'token',
  'authorization',
  'authtoken',
  'authToken',
  'sessiontoken',
  'sessionToken',
  'refreshtoken',
  'refreshToken',
  'accesstoken',
  'accessToken',
  'password',
  'secret',
  'credentialsecret',
  'credentialsSecret',
  'accountslug',
  'accountSlug',
  'errortext',
  'errorText',
  'responsebody',
  'responseBody',
  'rawbody',
  'rawBody',
  'customeremail',
  'customerEmail',
  'email',
  'phone',
  'phonenumber',
  'phoneNumber',
  'otp',
  'iban',
  'cvv',
  'cardnumber',
  'cardNumber',
  'pan',
] as const;

/**
 * FE-only sensitive keys — MUST NOT be mirrored onto the backend deny-list.
 * OTP / verification `code` would collide with domain API fields.
 */
export const CLIENT_ONLY_SENSITIVE_META_KEYS = ['code'] as const;

export type SharedSensitiveMetaKey = (typeof SHARED_SENSITIVE_META_KEYS)[number];
export type ClientOnlySensitiveMetaKey = (typeof CLIENT_ONLY_SENSITIVE_META_KEYS)[number];
