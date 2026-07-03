# Client event ID policy (G-I04 / AN-066)

## Format

- `clientEventId` MUST be a UUID v4 string (36 chars, lowercase hex with hyphens).
- Generated client-side at emit time; never reused across distinct logical events.

## Idempotency window

- Ingest deduplicates on `(tenantId, clientEventId)` — duplicate returns HTTP 200 `replayed`.
- Reuse the **same** `clientEventId` only when retrying the **same** logical event payload.

## Rotation rules

| Scenario | Policy |
| --- | --- |
| User retries same screen action | Reuse `clientEventId` for identical payload within retry window |
| New user action (new click/navigation) | Generate new UUID |
| Session reset / new session | Always new UUID |
| Offline queue flush | Preserve original `clientEventId` per queued item |

## Surfaces

- Kiosk: analytics transport before POST ingest
- Customer PWA: tenant-scoped ingest API
- Server emits: synthetic IDs or omit client path (server-only events)

## Related

- `up-backend/docs/INGEST_REJECTION_DIAGNOSTICS.md`
- Plan G-ING-05 (7-day replay TTL) — future hardening
