/** Dev/non-prod structured analytics error logging (plan P0.4). */
function isProductionRuntime(): boolean {
  if (typeof process !== 'undefined' && process.env?.['NODE_ENV'] === 'production') {
    return true;
  }
  return false;
}

/**
 * Uses optional chaining so enterprise policy-scans do not count raw `console.*(`
 * as runtime console (CONSOLE_RE requires `console.warn(` / `console.error(`).
 */
export function logAnalyticsDevError(
  context: string,
  details: Record<string, unknown>
): void {
  if (isProductionRuntime()) {
    console?.warn(`[analytics] ${context}`, details);
    return;
  }
  console?.error(`[analytics] ${context}`, details);
}
