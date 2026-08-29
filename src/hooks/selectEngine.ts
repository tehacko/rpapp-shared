/**
 * Decode engines used by {@link useBarcodeScanner}:
 * - `zbar-wasm` — ZBar C/C++ WASM (primary when boot succeeds; retail EAN/UPC + QR)
 * - `zxing` — pure-JS @zxing/browser parallel assist starting on **frame 0** (v2.2)
 * - `native-detector` — Chromium BarcodeDetector parallel assist when probe succeeds
 *
 * Boot failure (missing WASM URL / ZBar init error) → **degraded boot**: `degradedMode: true`,
 * `@zxing` + native (if available) run without hard error. Surfaces must read
 * `UseBarcodeScannerReturn.degradedMode`, not infer from `engine === 'zxing'` alone.
 *
 * Engine selection lives only in `useBarcodeScanner`.
 */
export type ScannerEngine = 'zbar-wasm' | 'zxing' | 'native-detector';
