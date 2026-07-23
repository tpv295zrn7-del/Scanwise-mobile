import {
  createBarcodeDetector,
  extractBarcodeValue
} from './barcodeDetection';

describe('barcodeDetection service', () => {
  test('extractBarcodeValue reads first barcode', () => {
    expect(extractBarcodeValue({ barcodes: [{ rawValue: '123' }] })).toBe('123');
    expect(extractBarcodeValue({ barcodes: [{ displayValue: '456' }] })).toBe('456');
    expect(extractBarcodeValue({ barcodes: [] })).toBeNull();
  });

  test('detector debounces duplicate scans and frame frequency', () => {
    let now = 0;
    const detector = createBarcodeDetector({
      debounceMs: 1000,
      frameIntervalMs: 100,
      now: () => now
    });

    now = 150;
    expect(detector.processFrame({ barcodes: [{ rawValue: '123' }] })).toBe('123');

    now = 200;
    expect(detector.processFrame({ barcodes: [{ rawValue: '999' }] })).toBeNull();

    now = 500;
    expect(detector.processFrame({ barcodes: [{ rawValue: '123' }] })).toBeNull();

    now = 1300;
    expect(detector.processFrame({ barcodes: [{ rawValue: '123' }] })).toBe('123');

    detector.reset();
    now = 2000;
    expect(detector.processFrame({ barcodes: [{ rawValue: '123' }] })).toBe('123');
  });
});
