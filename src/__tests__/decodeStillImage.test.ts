/**
 * @jest-environment jsdom
 *
 * Golden still-image decode against ean-8593807360153.png.
 *
 * Fixture generation (run once from repo root):
 *   node -e "const b=require('bwip-js');const fs=require('fs');b.toBuffer({bcid:'ean13',text:'8593807360153',scale:5,height:20,includetext:true,backgroundcolor:'FFFFFF',barcolor:'000000',paddingwidth:20,paddingheight:20}).then(buf=>fs.writeFileSync('shared/src/__tests__/fixtures/ean-8593807360153.png',buf));"
 *
 * jsdom cannot decode PNG bytes — fixture RGBA is loaded with `sharp` (shared devDependency)
 * and injected through mocked Image/canvas so decodeBarcodeFromImageFile exercises real engines.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { decodeBarcodeFromImageFile, preprocessStillImageData } from '../hooks/decodeStillImage.js';
import { resetZbarWasmUrlForTests, setZbarWasmUrl } from '../hooks/zbarWasmEngine.js';

const FIXTURE_PATH = join(__dirname, 'fixtures', 'ean-8593807360153.png');
const WASM_PATH = join(__dirname, '../../node_modules/@undecaf/zbar-wasm/dist/zbar.wasm');

let fixtureImageData!: ImageData;

describe('decodeBarcodeFromImageFile golden fixture', () => {
  beforeAll(async () => {
    if (typeof global.ImageData === 'undefined') {
      class PolyfillImageData {
        readonly data: Uint8ClampedArray;
        readonly width: number;
        readonly height: number;

        constructor(
          dataOrWidth: Uint8ClampedArray | number,
          widthOrHeight?: number,
          height?: number,
        ) {
          if (typeof dataOrWidth === 'number') {
            this.width = dataOrWidth;
            this.height = widthOrHeight ?? 0;
            this.data = new Uint8ClampedArray(this.width * this.height * 4);
          } else {
            this.data = dataOrWidth;
            this.width = widthOrHeight ?? 0;
            this.height = height ?? 0;
          }
        }
      }
      global.ImageData = PolyfillImageData as typeof ImageData;
    }

    const { data, info } = await sharp(FIXTURE_PATH)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    fixtureImageData = new ImageData(
      new Uint8ClampedArray(data),
      info.width,
      info.height,
    );

    Object.defineProperty(global.URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: jest.fn(() => 'blob:ean-8593807360153-fixture'),
    });
    Object.defineProperty(global.URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: jest.fn(),
    });

    class MockImage {
      naturalWidth = fixtureImageData.width;
      naturalHeight = fixtureImageData.height;
      onload: ((ev: Event) => void) | null = null;
      onerror: ((ev: Event) => void) | null = null;
      private _src = '';

      set src(value: string) {
        this._src = value;
        queueMicrotask(() => {
          this.onload?.(new Event('load'));
        });
      }

      get src(): string {
        return this._src;
      }
    }

    Object.defineProperty(global, 'Image', {
      configurable: true,
      writable: true,
      value: MockImage,
    });

    const originalCreateElement = document.createElement.bind(document);
    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = originalCreateElement(tagName);
      if (tagName.toLowerCase() === 'canvas') {
        const canvas = el as HTMLCanvasElement;
        canvas.getContext = jest.fn(() => ({
          drawImage: jest.fn(),
          putImageData: jest.fn(),
          getImageData: jest.fn(() => fixtureImageData),
          imageSmoothingEnabled: true,
          clearRect: jest.fn(),
        })) as unknown as HTMLCanvasElement['getContext'];
      }
      return el;
    });
  });

  beforeEach(() => {
    resetZbarWasmUrlForTests();
    setZbarWasmUrl(WASM_PATH);
  });

  it('decodes ean-8593807360153.png to payload 8593807360153', async () => {
    const buffer = readFileSync(FIXTURE_PATH);
    const file = new File([buffer], 'ean-8593807360153.png', { type: 'image/png' });
    const result = await decodeBarcodeFromImageFile(file, 'retail');
    expect(result).not.toBeNull();
    expect(result?.payload).toBe('8593807360153');
    expect(['zbar-wasm', 'zxing', 'native-detector']).toContain(result?.engine);
  }, 30_000);
});

describe('preprocessStillImageData', () => {
  it('returns grayscale ImageData with same dimensions', () => {
    const input = new ImageData(4, 2);
    input.data.set([
      255, 0, 0, 255, 0, 255, 0, 255,
      0, 0, 255, 255, 128, 128, 128, 255,
    ]);
    const out = preprocessStillImageData(input, false);
    expect(out.width).toBe(4);
    expect(out.height).toBe(2);
    expect(out.data.length).toBe(input.data.length);
    const changed = [...out.data].some((v, i) => v !== input.data[i]);
    expect(changed).toBe(true);
  });
});
