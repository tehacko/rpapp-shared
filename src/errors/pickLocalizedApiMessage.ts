import { normalizeLabelLocale, type LabelLocale } from '../labels/localizedLabel.js';

/**
 * Pick one language from CS-first API messages shaped as `CS / EN` or `CS / SK / EN`.
 * Non-matching strings (no slash segments, or >3 parts) are returned unchanged.
 */
export function pickLocalizedApiMessage(
  message: string,
  locale: string | undefined,
): string {
  const trimmed = message.trim();
  if (trimmed.length === 0) {
    return message;
  }

  const parts = trimmed.split(' / ').map((part) => part.trim()).filter((part) => part.length > 0);
  if (parts.length < 2 || parts.length > 3) {
    return message;
  }

  const loc: LabelLocale = normalizeLabelLocale(locale);
  if (parts.length === 3) {
    if (loc === 'cs') {
      return parts[0]!;
    }
    if (loc === 'sk') {
      return parts[1]!;
    }
    return parts[2]!;
  }

  // Legacy bilingual `CS / EN`
  if (loc === 'en') {
    return parts[1]!;
  }
  return parts[0]!;
}
