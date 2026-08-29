/**
 * Client-side scan payload sanitize + retail GTIN pre-check.
 * Server BarcodeNormalizationService remains authoritative on assign/lookup.
 */
import type { BarcodeScannerFormatProfile } from '../hooks/scannerFormats.js';

const GTIN_DIGIT_PATTERN = /^[\d\s-]+$/;

function extractDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function stripControlChars(value: string): string {
  let out = '';
  for (const char of value) {
    const code = char.charCodeAt(0);
    if (code <= 0x1f || code === 0x7f) {
      continue;
    }
    out += char;
  }
  return out;
}

function computeGtinCheckDigit(bodyDigits: string): number {
  let sum = 0;
  for (let i = 0; i < bodyDigits.length; i += 1) {
    const digit = Number.parseInt(bodyDigits[bodyDigits.length - 1 - i] ?? '0', 10);
    sum += digit * (i % 2 === 0 ? 3 : 1);
  }
  return (10 - (sum % 10)) % 10;
}

function isValidGtinCheckDigit(digits: string): boolean {
  if (digits.length < 8 || digits.length > 14) {
    return false;
  }
  const body = digits.slice(0, -1);
  const check = Number.parseInt(digits.slice(-1), 10);
  if (Number.isNaN(check)) {
    return false;
  }
  return computeGtinCheckDigit(body) === check;
}

function normalizeGtinDigits(digits: string): string | null {
  if (!isValidGtinCheckDigit(digits)) {
    return null;
  }
  if (digits.length === 8) {
    return digits;
  }
  if (digits.length === 12) {
    return `0${digits}`;
  }
  if (digits.length === 13) {
    return digits;
  }
  if (digits.length === 14) {
    const ean13 = digits.slice(1);
    if (isValidGtinCheckDigit(ean13)) {
      return ean13;
    }
    return digits;
  }
  if (digits.length < 13) {
    const padded = digits.padStart(13, '0');
    if (isValidGtinCheckDigit(padded)) {
      return padded;
    }
  }
  return digits;
}

/**
 * Trim + strip ASCII control chars (client pre-trim only).
 */
export function normalizeScanPayload(raw: string): string {
  return stripControlChars(raw.trim());
}

function shouldValidateGtin(formatProfile: BarcodeScannerFormatProfile): boolean {
  return formatProfile === 'retail' || formatProfile === 'all';
}

/**
 * Prepare a decode payload for emit. Returns null when retail GTIN check fails
 * (caller should continue scanning without onDecode).
 */
export function prepareScanPayloadForEmit(
  raw: string,
  formatProfile: BarcodeScannerFormatProfile,
): string | null {
  const sanitized = normalizeScanPayload(raw);
  if (sanitized.length === 0) {
    return null;
  }

  if (!shouldValidateGtin(formatProfile)) {
    return sanitized;
  }

  if (GTIN_DIGIT_PATTERN.test(sanitized)) {
    const digits = extractDigits(sanitized);
    if (digits.length >= 8 && digits.length <= 14) {
      const normalized = normalizeGtinDigits(digits);
      if (normalized === null) {
        return null;
      }
      return normalized;
    }
  }

  return sanitized;
}

/** @internal test export */
export function isGtinCheckDigitValidForTest(digits: string): boolean {
  return isValidGtinCheckDigit(digits);
}
