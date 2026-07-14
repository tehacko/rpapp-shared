/**
 * Compact IBAN for persistence and comparison (FD-32).
 * Strips whitespace and uppercases — display formatting stays in admin UI.
 */
export function normalizeIban(iban: string): string {
  return iban.replace(/\s+/g, '').toUpperCase();
}
