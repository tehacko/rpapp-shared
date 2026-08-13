/**
 * Shared PWA + kiosk contact-policy UI axes (Frozen G11).
 * Apps map copy variants to locale strings; do not hardcode dual-channel phrases.
 */
import type { CustomerContactPolicyPayload } from './customerContactPolicy.js';

/** Safe default when GET contact-policy has not loaded (matches AUTH default `email`). */
export const DEFAULT_CUSTOMER_CONTACT_POLICY_PAYLOAD: CustomerContactPolicyPayload = {
  policy: 'email',
  emailAllowed: true,
  phoneAllowed: false,
  emailInputRequired: true,
  phoneInputRequired: false,
  secondInputOptional: false,
  verifyBothRequired: false,
  optionalSecondVerify: false,
  oidcPhoneOptional: true,
  phoneOtpAvailable: false,
};

export type ContactPolicyOtpCopyVariant = 'email' | 'phone' | 'email_or_phone';

/** G17: phone in password copy/lookup only when policy allows phone. */
export type ContactPolicyPasswordCopyVariant = 'username_email' | 'username_email_phone';

export function resolveOtpIdentifierCopyVariant(
  policy: Pick<CustomerContactPolicyPayload, 'emailAllowed' | 'phoneAllowed'>
): ContactPolicyOtpCopyVariant {
  if (policy.emailAllowed && policy.phoneAllowed) {
    return 'email_or_phone';
  }
  if (policy.phoneAllowed) {
    return 'phone';
  }
  return 'email';
}

export function resolvePasswordIdentifierCopyVariant(
  policy: Pick<CustomerContactPolicyPayload, 'phoneAllowed'>
): ContactPolicyPasswordCopyVariant {
  return policy.phoneAllowed ? 'username_email_phone' : 'username_email';
}

/** Password may resolve E.164 via findByPhone when policy allows phone (G17 B). */
export function passwordAllowsPhoneLookup(
  policy: Pick<CustomerContactPolicyPayload, 'phoneAllowed'>
): boolean {
  return policy.phoneAllowed;
}

const EMAIL_LOOSE_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const E164_RE = /^\+[1-9]\d{7,14}$/;

export function normalizePhoneToE164(raw: string): string | null {
  const cleaned = raw.replace(/[\s().-]/g, '');
  if (!cleaned.startsWith('+') || !E164_RE.test(cleaned)) {
    return null;
  }
  return cleaned;
}

/**
 * Wave 4/5 identifier inputMode: phone / E.164 → tel; email-only → email;
 * dual policy classifies the current value.
 */
export function resolveSignInIdentifierInputMode(
  raw: string,
  policy: Pick<CustomerContactPolicyPayload, 'emailAllowed' | 'phoneAllowed'>
): 'tel' | 'email' {
  if (policy.phoneAllowed && !policy.emailAllowed) {
    return 'tel';
  }
  if (policy.emailAllowed && !policy.phoneAllowed) {
    return 'email';
  }
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return 'email';
  }
  if (EMAIL_LOOSE_RE.test(trimmed)) {
    return 'email';
  }
  if (normalizePhoneToE164(trimmed) !== null || /^\+?\d[\d\s().-]{5,}$/.test(trimmed)) {
    return 'tel';
  }
  return 'email';
}
