export const extractBarcodeValue = (frame) => {
  const firstBarcode = frame?.barcodes?.[0];
  if (!firstBarcode) return null;
  return firstBarcode.rawValue || firstBarcode.displayValue || null;
};

export const createBarcodeDetector = ({
  debounceMs = 1500,
  frameIntervalMs = 250,
  now = Date.now
} = {}) => {
  let lastBarcode = null;
  let lastDetectedAt = 0;
  let lastFrameAt = 0;

  const processFrame = (frame) => {
    const currentTime = now();
    if (currentTime - lastFrameAt < frameIntervalMs) {
      return null;
    }
    lastFrameAt = currentTime;

    const barcode = extractBarcodeValue(frame);
    if (!barcode) {
      return null;
    }

    if (barcode === lastBarcode && currentTime - lastDetectedAt < debounceMs) {
      return null;
    }

    lastBarcode = barcode;
    lastDetectedAt = currentTime;
    return barcode;
  };

  const reset = () => {
    lastBarcode = null;
    lastDetectedAt = 0;
    lastFrameAt = 0;
  };

  return {
    processFrame,
    reset
  };
};
