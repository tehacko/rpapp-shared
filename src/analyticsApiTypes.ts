/**
 * Analytics API response shapes — tenant-scoped sessions controller envelope.
 *
 * POST /api/{tenant}/v1/analytics/sessions returns:
 *   { success: true, data: { session: { sessionId, ... }, created, sessionAuthToken?, ... } }
 */
export interface AnalyticsStartSessionData {
  readonly session: {
    readonly sessionId: string;
    readonly id?: number;
    readonly tenantId?: number;
    readonly kioskId?: number | null;
    readonly deviceId?: number | null;
    readonly startedAt?: string;
    readonly completed?: boolean;
    readonly abandoned?: boolean;
  };
  readonly created: boolean;
  readonly sessionAuthToken?: string;
  readonly sessionAuthTokenExpiresAt?: string;
}

export interface ParsedAnalyticsStartSession {
  readonly sessionId: string;
  readonly created: boolean;
  readonly sessionAuthToken?: string;
  readonly sessionAuthTokenExpiresAt?: string;
}

/**
 * Parse nested session start payload. No flat `sessionId` fallback.
 */
export function parseAnalyticsStartSessionData(data: unknown): ParsedAnalyticsStartSession {
  if (typeof data !== 'object' || data === null) {
    throw new Error('analytics_start_session_invalid_shape');
  }
  const record = data as Record<string, unknown>;
  const session = record['session'];
  if (typeof session !== 'object' || session === null) {
    throw new Error('analytics_start_session_missing_session');
  }
  const sessionRecord = session as Record<string, unknown>;
  const sessionId = sessionRecord['sessionId'];
  if (typeof sessionId !== 'string' || sessionId.length < 8) {
    throw new Error('analytics_start_session_missing_session_id');
  }
  const sessionAuthToken = record['sessionAuthToken'];
  const sessionAuthTokenExpiresAt = record['sessionAuthTokenExpiresAt'];
  return {
    sessionId,
    created: record['created'] === true,
    sessionAuthToken:
      typeof sessionAuthToken === 'string' && sessionAuthToken.length > 0
        ? sessionAuthToken
        : undefined,
    sessionAuthTokenExpiresAt:
      typeof sessionAuthTokenExpiresAt === 'string' &&
      sessionAuthTokenExpiresAt.length > 0
        ? sessionAuthTokenExpiresAt
        : undefined,
  };
}
