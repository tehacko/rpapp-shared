/**
 * Client-side pre-trim only — server BarcodeNormalizationService remains authoritative.
 */
export function normalizeScanPayload(raw: string): string {
  return raw.trim();
}
