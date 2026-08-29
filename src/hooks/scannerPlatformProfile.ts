/**
 * Platform-specific scanner engine ordering and UX hints.
 * Firefox: ZBar WASM + @zxing only — no @undecaf/barcode-detector-polyfill package.
 */

export type ScannerPlatformProfileId =
  | 'chrome-android'
  | 'chrome-desktop'
  | 'ios-safari'
  | 'crios-ios'
  | 'firefox-desktop'
  | 'generic';

export interface ScannerPlatformProfile {
  readonly id: ScannerPlatformProfileId;
  /** Prefer preview snap CTA over live-only decode (PC webcams). */
  readonly preferPreviewSnap: boolean;
  /** Run Chromium BarcodeDetector when probe succeeds. */
  readonly nativeEnabled: boolean;
  /** ZBar full pass every frame (desktop); mobile uses budget backoff in hook. */
  readonly zbarFullPassEveryFrame: boolean;
  /** @zxing assist starts on frame 0 (always true in v2.2). */
  readonly zxingFrameZero: boolean;
}

function isIosDevice(ua: string): boolean {
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes('Mac') && typeof document !== 'undefined' && 'ontouchend' in document);
}

function isCriOs(ua: string): boolean {
  return /CriOS/.test(ua);
}

function isFirefox(ua: string): boolean {
  return /Firefox\//.test(ua) && !/Seamonkey|Waterfox/.test(ua);
}

function isChromeDesktop(ua: string): boolean {
  return /Chrome\//.test(ua) && !/Edg\/|OPR\/|CriOS|Mobile/.test(ua);
}

function isChromeAndroid(ua: string): boolean {
  return /Android/.test(ua) && /Chrome\//.test(ua) && !/Edg\//.test(ua);
}

/**
 * Resolve scanner platform profile from UA + feature hints.
 * Safe in SSR (returns `generic`).
 */
export function resolveScannerPlatformProfile(): ScannerPlatformProfile {
  if (typeof navigator === 'undefined') {
    return genericProfile();
  }
  const ua = navigator.userAgent;

  if (isFirefox(ua)) {
    return {
      id: 'firefox-desktop',
      preferPreviewSnap: true,
      nativeEnabled: false,
      zbarFullPassEveryFrame: true,
      zxingFrameZero: true,
    };
  }

  if (isCriOs(ua) && isIosDevice(ua)) {
    return {
      id: 'crios-ios',
      preferPreviewSnap: false,
      nativeEnabled: false,
      zbarFullPassEveryFrame: false,
      zxingFrameZero: true,
    };
  }

  if (isIosDevice(ua)) {
    return {
      id: 'ios-safari',
      preferPreviewSnap: false,
      nativeEnabled: false,
      zbarFullPassEveryFrame: false,
      zxingFrameZero: true,
    };
  }

  if (isChromeDesktop(ua)) {
    return {
      id: 'chrome-desktop',
      preferPreviewSnap: true,
      nativeEnabled: true,
      zbarFullPassEveryFrame: true,
      zxingFrameZero: true,
    };
  }

  if (isChromeAndroid(ua)) {
    return {
      id: 'chrome-android',
      preferPreviewSnap: false,
      nativeEnabled: true,
      zbarFullPassEveryFrame: true,
      zxingFrameZero: true,
    };
  }

  return genericProfile();
}

function genericProfile(): ScannerPlatformProfile {
  return {
    id: 'generic',
    preferPreviewSnap: false,
    nativeEnabled: typeof window !== 'undefined' && window.BarcodeDetector !== undefined,
    zbarFullPassEveryFrame: false,
    zxingFrameZero: true,
  };
}

export { resolveScannerPlatformProfile as getScannerPlatformProfile };
