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

export async function fetchTurnstileConfig(apiBaseUrl = ''): Promise<TurnstileConfigData> {
  const trimmedBase = apiBaseUrl.replace(/\/+$/, '');
  const url = `${trimmedBase}${TURNSTILE_PUBLIC_CONFIG_PATH}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { enabled: false, siteKey: null };
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
  } catch {
    return { enabled: false, siteKey: null };
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
