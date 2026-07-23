/**
 * Sentry correlation-id bridge — no `@sentry/*` imports.
 *
 * Frontend apps call {@link registerSentryCorrelationTagger} from `initSentry`
 * after a successful browser init. Backend / Node consumers of `api.ts` can call
 * {@link setSentryCorrelationId} without resolving `@sentry/react`.
 */

export type SentryCorrelationTagger = (id: string) => void;

let tagger: SentryCorrelationTagger | null = null;

/** Wire a tagger after Sentry init (or clear with `null`). */
export function registerSentryCorrelationTagger(
  fn: SentryCorrelationTagger | null
): void {
  tagger = fn;
}

/**
 * Tag the active Sentry scope with `correlationId` when a tagger is registered.
 * No-op when Sentry has not been initialized (backend / DSN-less clients).
 */
export function setSentryCorrelationId(id: string): void {
  tagger?.(id);
}
