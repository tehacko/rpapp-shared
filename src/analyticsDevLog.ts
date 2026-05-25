/** Dev/non-prod structured analytics error logging (plan P0.4). */
function isProductionRuntime(): boolean {
  if (typeof process !== 'undefined' && process.env?.['NODE_ENV'] === 'production') {
    return true;
  }
  return false;
}

export function logAnalyticsDevError(
  context: string,
  details: Record<string, unknown>
): void {
  if (isProductionRuntime()) {
    return;
  }
  console.error(`[analytics] ${context}`, details);
}
