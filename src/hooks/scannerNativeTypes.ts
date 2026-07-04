export interface NativeBarcodeDetector {
  detect: (source: CanvasImageSource) => Promise<Array<{ rawValue: string }>>;
}

export interface NativeBarcodeDetectorConstructor {
  new (init?: { formats?: string[] }): NativeBarcodeDetector;
  getSupportedFormats: () => Promise<string[]>;
}

declare global {
  interface Window {
    BarcodeDetector?: NativeBarcodeDetectorConstructor;
  }
}

export {};
