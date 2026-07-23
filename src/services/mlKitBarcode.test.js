import { detectBarcodesInFrame, normalizeConfidence } from './mlKitBarcode';

describe('mlKitBarcode service', () => {
  test('detects a valid barcode and returns normalized confidence', async () => {
    const detectBarcodes = jest.fn().mockResolvedValue([
      {
        rawValue: '0123456789012',
        format: 'EAN_13',
        boundingBox: { x: 1, y: 2, width: 3, height: 4 },
        confidence: 0.98
      }
    ]);

    await expect(
      detectBarcodesInFrame(
        { frameId: 'a' },
        { mlKitVision: { detectBarcodes } }
      )
    ).resolves.toEqual({
      success: true,
      barcode: '0123456789012',
      format: 'EAN_13',
      boundingBox: { x: 1, y: 2, width: 3, height: 4 },
      confidence: 'verified'
    });
  });

  test('returns no_barcode when nothing is detected', async () => {
    await expect(
      detectBarcodesInFrame({}, { mlKitVision: { detectBarcodes: jest.fn().mockResolvedValue([]) } })
    ).resolves.toEqual({ success: false, reason: 'no_barcode' });
  });

  test('returns multiple_barcodes when more than one barcode exists', async () => {
    await expect(
      detectBarcodesInFrame(
        {},
        {
          mlKitVision: {
            detectBarcodes: jest.fn().mockResolvedValue([
              { rawValue: '111' },
              { rawValue: '222' }
            ])
          }
        }
      )
    ).resolves.toEqual({ success: false, reason: 'multiple_barcodes' });
  });

  test('returns detection_error with message when ML Kit throws', async () => {
    await expect(
      detectBarcodesInFrame(
        {},
        {
          mlKitVision: {
            detectBarcodes: jest.fn().mockRejectedValue(new Error('camera crashed'))
          }
        }
      )
    ).resolves.toEqual({
      success: false,
      reason: 'detection_error',
      error: 'camera crashed'
    });
  });

  test('normalizes confidence states', () => {
    expect(normalizeConfidence()).toBe('estimated');
    expect(normalizeConfidence({ confidence: 0.95 })).toBe('verified');
    expect(normalizeConfidence({ confidence: 0.8 })).toBe('estimated');
    expect(normalizeConfidence({ confidence: 0.2 })).toBe('incomplete');
    expect(normalizeConfidence({})).toBe('estimated');
  });

  test('supports alternate detector methods and result wrappers', async () => {
    const scanBarcodes = jest.fn().mockResolvedValue({
      barcodes: [{ displayValue: 'wrapped-barcode', confidence: 0.76 }]
    });
    await expect(
      detectBarcodesInFrame({}, { mlKitVision: { scanBarcodes } })
    ).resolves.toEqual(
      expect.objectContaining({
        success: true,
        barcode: 'wrapped-barcode',
        confidence: 'estimated'
      })
    );
  });

  test('returns no_barcode when detected item has no readable value', async () => {
    await expect(
      detectBarcodesInFrame(
        {},
        { mlKitVision: { detect: jest.fn().mockResolvedValue([{}]) } }
      )
    ).resolves.toEqual({ success: false, reason: 'no_barcode' });
  });

  test('falls back to frame barcodes when detector function is unavailable', async () => {
    await expect(
      detectBarcodesInFrame(
        {
          barcodes: [{ value: 'fallback-value', confidence: 0.3 }]
        },
        { mlKitVision: {} }
      )
    ).resolves.toEqual(
      expect.objectContaining({
        success: true,
        barcode: 'fallback-value',
        confidence: 'incomplete'
      })
    );
  });

  test('falls back cleanly when ML Kit module cannot be loaded', async () => {
    jest.resetModules();
    jest.doMock('@react-native-ml-kit/barcode-scanning', () => {
      throw new Error('module not linked');
    });
    const { detectBarcodesInFrame: detectBarcodesWithMissingModule } = require('./mlKitBarcode');

    await expect(
      detectBarcodesWithMissingModule({
        barcodes: [{ rawValue: 'module-fallback', confidence: 0.96 }]
      })
    ).resolves.toEqual(
      expect.objectContaining({
        success: true,
        barcode: 'module-fallback',
        confidence: 'verified'
      })
    );
  });

  test('returns no_barcode when fallback frame/result containers are empty', async () => {
    await expect(detectBarcodesInFrame(undefined, { mlKitVision: {} })).resolves.toEqual(
      {
        success: false,
        reason: 'no_barcode'
      }
    );

    await expect(
      detectBarcodesInFrame({}, { mlKitVision: { detectBarcodes: jest.fn().mockResolvedValue({}) } })
    ).resolves.toEqual({
      success: false,
      reason: 'no_barcode'
    });
  });
});
