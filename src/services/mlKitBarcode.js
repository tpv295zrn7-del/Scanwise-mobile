const BARCODE_FORMATS = [
  'CODE_128',
  'CODE_39',
  'EAN_13',
  'EAN_8',
  'UPC_A',
  'UPC_E',
  'QR_CODE'
];

const getMLKitVisionModule = () => {
  try {
    return require('@react-native-ml-kit/barcode-scanning');
  } catch (_error) {
    return null;
  }
};

const resolveDetector = (module) => {
  if (!module) {
    return null;
  }

  const candidates = [
    module.detectBarcodes,
    module.scanBarcodes,
    module.detect,
    module.default?.detectBarcodes,
    module.default?.scanBarcodes,
    module.default?.detect
  ];

  return candidates.find((candidate) => typeof candidate === 'function') || null;
};

const getBarcodeValue = (barcode) =>
  barcode?.rawValue || barcode?.displayValue || barcode?.value || null;

export const normalizeConfidence = (barcode = {}) => {
  if (typeof barcode.confidence !== 'number') return 'estimated';
  if (barcode.confidence >= 0.95) return 'verified';
  if (barcode.confidence >= 0.75) return 'estimated';
  return 'incomplete';
};

export const detectBarcodesInFrame = async (
  frameImage,
  { mlKitVision = getMLKitVisionModule() } = {}
) => {
  try {
    const detectBarcodes = resolveDetector(mlKitVision);
    const result = detectBarcodes
      ? await detectBarcodes(frameImage, {
          formats: BARCODE_FORMATS,
          returnRawValue: true
        })
      : frameImage?.barcodes || [];
    const barcodes = Array.isArray(result) ? result : result?.barcodes || [];

    if (!barcodes.length) {
      return { success: false, reason: 'no_barcode' };
    }

    if (barcodes.length > 1) {
      return { success: false, reason: 'multiple_barcodes' };
    }

    const barcode = barcodes[0];
    const value = getBarcodeValue(barcode);
    if (!value) {
      return { success: false, reason: 'no_barcode' };
    }

    return {
      success: true,
      barcode: value,
      format: barcode.format,
      boundingBox: barcode.boundingBox,
      confidence: normalizeConfidence(barcode)
    };
  } catch (error) {
    return {
      success: false,
      reason: 'detection_error',
      error: error.message
    };
  }
};
