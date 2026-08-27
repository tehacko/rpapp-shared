/**
 * Decode engines used by {@link useBarcodeScanner}:
 * - `zxing-wasm` — ZXing-C++ WASM (primary; highest sensitivity; requires configured URL)
 * - `native-detector` — Chromium BarcodeDetector (fast path when formats OK)
 * - `zxing` — pure-JS @zxing fallback when WASM/native cannot start
 *
 * Engine selection lives only in `useBarcodeScanner` (runtime cascade).
 * There is no separate `selectBarcodeScannerEngine` helper — that was a dual SoT (G7).
 */
export type ScannerEngine = 'zxing-wasm' | 'native-detector' | 'zxing';
