/**
 * Decode engines used by {@link useBarcodeScanner}:
 * - `zxing` — pure-JS @zxing/browser (decodeFromStream + multi-pass zoom)
 * - `native-detector` — legacy union member; G5 no longer starts native-only
 *   (weak path without TRY_HARDER / multi-pass). Kept for API compatibility.
 *
 * Engine selection lives only in `useBarcodeScanner`.
 */
export type ScannerEngine = 'zxing' | 'native-detector';
