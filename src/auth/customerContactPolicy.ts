/**
 * Platform customer contact policy — public GET /customer-auth/contact-policy payload.
 * Shared by customer PWA + kiosk (no VITE_CUSTOMER_CONTACT_POLICY).
 */

export const CUSTOMER_CONTACT_POLICY_MODES = [
  'email',
  'phone',
  'both_loose',
  'both_required',
  'both_enforce',
] as const;

export type CustomerContactPolicyMode = (typeof CUSTOMER_CONTACT_POLICY_MODES)[number];

/** Frozen GET …/customer-auth/contact-policy `data` axes. */
export interface CustomerContactPolicyPayload {
  policy: CustomerContactPolicyMode;
  emailAllowed: boolean;
  phoneAllowed: boolean;
  emailInputRequired: boolean;
  phoneInputRequired: boolean;
  /** `both_loose` only — second channel input is optional. */
  secondInputOptional: boolean;
  /** `both_enforce` only — both provided channels must be verified. */
  verifyBothRequired: boolean;
  /** `both_required` | `both_loose` — leftover Ověřit stays optional after one channel. */
  optionalSecondVerify: boolean;
  /** OIDC add-phone is always optional (G8). */
  oidcPhoneOptional: boolean;
  /** Policy allows phone and SMS OTP transport is ready. */
  phoneOtpAvailable: boolean;
}

export {
  resolveContactIdentifierCopyKind,
  resolveContactIdentifierInputMode,
  resolvePasswordIdentifierCopyKind,
  type ContactIdentifierCopyKind,
  type PasswordIdentifierCopyKind,
} from './customerContactPolicyLabels.js';
