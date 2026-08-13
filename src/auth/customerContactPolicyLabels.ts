/**
 * G11 — shared PWA + kiosk label helpers for contact-policy-driven copy.
 * Default axes match Rest A (`email`) when payload is missing.
 */

import type { CustomerContactPolicyPayload } from './customerContactPolicy.js';

export type ContactIdentifierCopyKind = 'email' | 'phone' | 'emailOrPhone';

export type PasswordIdentifierCopyKind = 'withoutPhone' | 'withPhone';

type ContactPolicyAxes = Pick<
  CustomerContactPolicyPayload,
  'emailAllowed' | 'phoneAllowed'
>;

/** Resolve which identifier copy to show from GET contact-policy axes. */
export function resolveContactIdentifierCopyKind(
  policy: ContactPolicyAxes | null | undefined,
): ContactIdentifierCopyKind {
  if (policy == null) {
    return 'email';
  }
  if (policy.emailAllowed && policy.phoneAllowed) {
    return 'emailOrPhone';
  }
  if (policy.phoneAllowed && !policy.emailAllowed) {
    return 'phone';
  }
  return 'email';
}

/** Password lookup copy — phone only when policy allows phone (G17). */
export function resolvePasswordIdentifierCopyKind(
  policy: ContactPolicyAxes | null | undefined,
): PasswordIdentifierCopyKind {
  if (policy?.phoneAllowed === true) {
    return 'withPhone';
  }
  return 'withoutPhone';
}

/**
 * Identifier `inputMode`: phone-only → tel; email-only → email;
 * dual → tel when value looks like E.164 / digits, else email.
 * Prefer `type="text"` with this inputMode (not native type=email).
 */
export function resolveContactIdentifierInputMode(args: {
  copyKind: ContactIdentifierCopyKind;
  rawIdentifier: string;
}): 'email' | 'tel' {
  if (args.copyKind === 'phone') {
    return 'tel';
  }
  if (args.copyKind === 'email') {
    return 'email';
  }
  const trimmed = args.rawIdentifier.trim();
  if (trimmed.startsWith('+')) {
    return 'tel';
  }
  if (/^\d[\d\s().-]{5,}$/.test(trimmed)) {
    return 'tel';
  }
  return 'email';
}
