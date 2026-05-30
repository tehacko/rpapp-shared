/**
 * Client log metadata redaction (enterprise hardening v1.2.3).
 * Used by admin, kiosk, and customer structured loggers before console transport.
 */

const SENSITIVE_KEYS = new Set([
  'apitoken',
  'apiToken',
  'token',
  'authorization',
  'authtoken',
  'authToken',
  'sessiontoken',
  'sessionToken',
  'refreshtoken',
  'refreshToken',
  'accesstoken',
  'accessToken',
  'password',
  'secret',
  'credentialsecret',
  'credentialsSecret',
  'accountslug',
  'accountSlug',
  'errortext',
  'errorText',
  'responsebody',
  'responseBody',
  'rawbody',
  'rawBody',
  'customeremail',
  'customerEmail',
  'email',
  'phone',
  'phonenumber',
  'phoneNumber',
  'code',
  'otp',
  'cardnumber',
  'cardNumber',
  'pan',
]);

const MAX_DEPTH = 4;

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEYS.has(key) || SENSITIVE_KEYS.has(key.toLowerCase());
}

/** Redact tokens, emails, and card-like digit runs in free-text log messages. */
export function redactStringSecrets(value: string): string {
  let out = value;
  out = out.replace(/(Bearer\s+)[A-Za-z0-9._-]{16,}/gi, '$1[REDACTED]');
  out = out.replace(/([?&](?:apiToken|token|api_key|apikey)=)([^&\s]+)/gi, '$1[REDACTED]');
  out = out.replace(/\b\d{13,19}\b/g, '[REDACTED_PII]');
  out = out.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    '[REDACTED_EMAIL]'
  );
  return out;
}

function redactValue(value: unknown, depth: number): unknown {
  if (depth > MAX_DEPTH) {
    return '[REDACTED_DEPTH]';
  }
  if (value === null || value === undefined) {
    return value;
  }
  if (typeof value === 'string') {
    return redactStringSecrets(value);
  }
  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactStringSecrets(value.message),
    };
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, depth + 1));
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(record)) {
      if (isSensitiveKey(key)) {
        out[key] = '[REDACTED]';
      } else {
        out[key] = redactValue(nested, depth + 1);
      }
    }
    return out;
  }
  return value;
}

/** Redact structured metadata before console transport or JSON log lines. */
export function redactClientLogMeta(
  meta: Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
  if (meta === undefined) {
    return undefined;
  }
  return redactValue(meta, 0) as Record<string, unknown>;
}
