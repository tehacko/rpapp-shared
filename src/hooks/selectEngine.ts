/**
 * Decode engines used by {@link useBarcodeScanner}:
 * - `zbar-wasm` — ZBar C/C++ WASM (primary when boot succeeds; retail EAN/UPC + QR)
 * - `zxing` — pure-JS @zxing/browser timed parallel assist (G4) when ZBar runs but
 *   does not decode within the assist delay; not a boot fallback
 * - `native-detector` — Chromium BarcodeDetector parallel assist; never the sole engine
 *
 * Boot failure (missing WASM URL / ZBar init error) → `status: 'error'`, not `@zxing`.
 * Engine selection lives only in `useBarcodeScanner`.
 */
export type ScannerEngine = 'zbar-wasm' | 'zxing' | 'native-detector';
