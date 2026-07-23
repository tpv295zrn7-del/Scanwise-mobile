import { createBarcodeDetector } from '../services/barcodeDetection';

export const ScanScreen = ({
  scanBarcode,
  requestCameraPermission,
  onHaptic,
  onError,
  navigation,
  cameraAvailable = true
} = {}) => {
  let permission = 'unknown';
  let lastBarcode = null;
  let scanning = true;
  let error = null;

  const detector = createBarcodeDetector();

  const submitScan = async (barcode) => {
    if (!barcode || !scanning) return null;

    try {
      if (onHaptic) onHaptic('impactMedium');
      const response = await scanBarcode?.(barcode);
      lastBarcode = barcode;
      scanning = false;
      navigation?.navigate?.('ProductResultScreen', {
        barcode,
        result: response?.data || response
      });
      return response;
    } catch (scanError) {
      error = scanError.message;
      if (onError) onError(scanError);
      return null;
    }
  };

  return {
    illustration: require('../assets/scan-illustration.png'),
    mode: 'vision-camera',
    cameraAvailable,
    overlay: 'scan-rectangle',
    instructionText: 'Align barcode within frame',
    cancelButton: 'Cancel',
    manualEntryEnabled: true,
    get permission() {
      return permission;
    },
    get lastBarcode() {
      return lastBarcode;
    },
    get scanning() {
      return scanning;
    },
    get error() {
      return error;
    },
    requestPermission: async () => {
      permission = (await requestCameraPermission?.()) || 'denied';
      return permission;
    },
    processFrame: async (frame) => {
      const barcode = detector.processFrame(frame);
      if (!barcode) return null;
      return submitScan(barcode);
    },
    submitManualEntry: (barcode) => submitScan(barcode),
    openSettings: () => permission === 'denied'
  };
};
