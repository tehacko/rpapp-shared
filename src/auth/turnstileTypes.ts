/**
 * Cloudflare Turnstile — shared auth request fields and public config contract.
 */

export const TURNSTILE_PUBLIC_CONFIG_PATH = '/api/public/turnstile-config';

export interface TurnstileConfigData {
  enabled: boolean;
  siteKey: string | null;
}

export interface TurnstileAuthBodyFields {
  turnstileToken?: string;
}

export interface AdminLoginRequest extends TurnstileAuthBodyFields {
  username: string;
  password: string;
}

export interface ExchangeSuperAdminInviteSessionRequest extends TurnstileAuthBodyFields {
  token: string;
}

export interface CompleteSuperAdminInviteRequest extends TurnstileAuthBodyFields {
  token?: string;
  username: string;
  password: string;
}

export interface PickupStaffLoginRequest extends TurnstileAuthBodyFields {
  salesPointId: number;
  pin: string;
}

export interface CustomerAuthTurnstileBody extends TurnstileAuthBodyFields {
  [key: string]: unknown;
}

export class TurnstileConfigFetchError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'TurnstileConfigFetchError';
  }
}

/**
 * Fetches public Turnstile config. Throws {@link TurnstileConfigFetchError} on
 * network/HTTP failure so clients can fail closed (do not assume disabled).
 */
export async function fetchTurnstileConfig(apiBaseUrl = ''): Promise<TurnstileConfigData> {
  const trimmedBase = apiBaseUrl.replace(/\/+$/, '');
  const url = `${trimmedBase}${TURNSTILE_PUBLIC_CONFIG_PATH}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new TurnstileConfigFetchError(
        `Turnstile config request failed (${String(response.status)}). Retry in a few seconds or refresh the page.`
      );
    }
    const envelope = (await response.json()) as {
      success?: boolean;
      data?: { enabled?: boolean; siteKey?: string | null };
    };
    const data = envelope.data;
    return {
      enabled: data?.enabled === true,
      siteKey: typeof data?.siteKey === 'string' && data.siteKey.length > 0 ? data.siteKey : null,
    };
  } catch (err) {
    if (err instanceof TurnstileConfigFetchError) {
      throw err;
    }
    throw new TurnstileConfigFetchError(
      'Turnstile config is unreachable. Check network connectivity, then retry or refresh the page.',
      { cause: err }
    );
  }
}

export function appendTurnstileToken<T extends Record<string, unknown>>(
  body: T,
  turnstileToken: string | null | undefined
): T & TurnstileAuthBodyFields {
  if (typeof turnstileToken === 'string' && turnstileToken.length > 0) {
    return { ...body, turnstileToken };
  }
  return body;
}
