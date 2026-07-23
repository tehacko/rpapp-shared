/**
 * Module-level last-seen correlation id convenience for Sentry tags / diagnostics.
 *
 * Limitation: this is process/tab-global last-write-wins — concurrent in-flight
 * requests can overwrite each other. Prefer passing `correlationId` explicitly
 * in logger meta on error paths; do not treat this alone as request Consistency.
 */

let lastCorrelationId: string | undefined;

export function getClientCorrelationId(): string | undefined {
  return lastCorrelationId;
}

export function setClientCorrelationId(id: string | undefined): void {
  lastCorrelationId = id;
}

/** Test-only reset. */
export function resetClientCorrelationIdForTests(): void {
  lastCorrelationId = undefined;
}
