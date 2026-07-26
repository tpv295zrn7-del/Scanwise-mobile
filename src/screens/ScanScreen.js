import { scanProductByBarcode } from '../redux/thunks/scanThunk';
import { CancelButton } from '../components/CancelButton';
import { ScanOverlay } from '../components/ScanOverlay';
import {
  checkCameraPermission,
  requestCameraPermission as requestCameraPermissionService
} from '../services/cameraPermissions';
import {
  triggerError,
  triggerNotification,
  triggerSuccess
} from '../services/haptic';

const CAMERA_PERMISSION_ERROR =
  'Camera permission is required to scan products.';
const MANUAL_ENTRY_ERROR = 'Enter a barcode to continue.';
const DEFAULT_SCAN_ERROR = 'Unable to scan product. Please try again.';

const isSuccessfulScan = (action) =>
  Boolean(action) &&
  (typeof action.type !== 'string' || action.type.endsWith('/fulfilled'));

const getDetectedValue = (value) => {
  if (Array.isArray(value)) {
    return value[0]?.value || value[0]?.rawValue || '';
  }

  return value?.value || value?.rawValue || value || '';
};

export const ScanScreen = ({
  dispatch = async (action) => action,
  scanBarcode,
  requestCameraPermission,
  onHaptic,
  onError,
  navigation,
  cameraAvailable = true,
  initialPermission = 'unknown'
} = {}) => {
  let mode = 'expo-camera';
  let permission = initialPermission;
  let cameraFocused = false;
  let loading = false;
  let error = null;
  let manualEntry = '';
  let detectedBarcode = null;
  let lastBarcode = null;
  let currentScan = null;
  let scanning = true;

  const normalizePermissionResult = (value) => {
    if (value === 'granted' || value === true) {
      return 'granted';
    }
    if (value === 'unknown') {
      return 'unknown';
    }
    return 'denied';
  };

  const submitScan = async (value, detection = {}) => {
    if (loading || !scanning) {
      return null;
    }

    const barcode = `${value || ''}`.trim();
    if (!barcode) {
      error = MANUAL_ENTRY_ERROR;
      triggerError();
      return null;
    }

    loading = true;
    error = null;
    detectedBarcode = barcode;
    lastBarcode = barcode;

    if (onHaptic) {
      onHaptic('impactMedium');
    } else {
      triggerSuccess();
    }

    try {
      if (scanBarcode) {
        const response = await scanBarcode(barcode);
        const responseData = response?.data || response;
        if (responseData && typeof responseData === 'object') {
          currentScan = {
            ...responseData,
            barcode: responseData.barcode || barcode,
            confidence:
              detection.confidence || responseData.confidence || 'estimated'
          };
          if (detection.format || detection.boundingBox) {
            currentScan.detection = {
              format: detection.format,
              boundingBox: detection.boundingBox
            };
          }
        } else {
          currentScan = responseData;
        }
        scanning = false;
        navigation?.navigate?.('ProductResult', {
          scanResult: {
            ...currentScan,
            barcode: currentScan?.barcode || barcode,
          },
        });
        return response;
      }

      const action = await dispatch(scanProductByBarcode(barcode));
      if (!isSuccessfulScan(action)) {
        error = action?.error?.message || DEFAULT_SCAN_ERROR;
        triggerError();
        return null;
      }

      const payload = action.payload || action;
      currentScan = {
        ...payload,
        barcode,
        confidence: detection.confidence || payload?.confidence || 'estimated'
      };
      if (detection.format || detection.boundingBox) {
        currentScan.detection = {
          format: detection.format,
          boundingBox: detection.boundingBox
        };
      }
      scanning = false;
      navigation?.navigate?.('ProductResult', { scanResult: currentScan });
      return currentScan;
    } catch (scanError) {
      error = scanError.message || DEFAULT_SCAN_ERROR;
      if (onError) {
        onError(scanError);
      }
      triggerError();
      return null;
    } finally {
      loading = false;
    }
  };

  const screen = {
    illustration: require('../assets/scan-illustration.png'),
    overlay: 'scan-rectangle',
    scanButton: 'Scan Product',
    manualEntryButton: 'Manual Entry',
    cancelButton: 'Cancel',
    instructionText: 'Align barcode within frame',
    manualEntryEnabled: true,
    cameraAvailable,
    scanOverlay: ScanOverlay({ text: 'Align barcode within frame' }),
    cancelButtonModel: CancelButton({
      onPress: () => navigation?.goBack?.()
    }),
    get mode() {
      return mode;
    },
    get permission() {
      return permission;
    },
    get cameraPermission() {
      return permission;
    },
    get cameraFocused() {
      return cameraFocused;
    },
    get loading() {
      return loading;
    },
    get error() {
      return error;
    },
    get manualEntry() {
      return manualEntry;
    },
    get detectedBarcode() {
      return detectedBarcode;
    },
    get lastBarcode() {
      return lastBarcode;
    },
    get currentScan() {
      return currentScan;
    },
    get scanning() {
      return scanning;
    }
  };

  screen.loadCameraPermission = async () => {
    permission = await checkCameraPermission();
    return permission;
  };

  screen.requestPermission = async () => {
    const result = requestCameraPermission
      ? await requestCameraPermission()
      : scanBarcode
        ? 'denied'
        : await requestCameraPermissionService();
    permission = normalizePermissionResult(result);
    if (permission !== 'granted') {
      error = CAMERA_PERMISSION_ERROR;
    }
    return permission;
  };

  screen.ensureCameraPermission = async () => {
    const currentPermission =
      permission === 'unknown' ? await screen.loadCameraPermission() : permission;

    if (currentPermission === 'granted') {
      return true;
    }

    return (await screen.requestPermission()) === 'granted';
  };

  screen.focusCamera = async () => {
    error = null;
    const granted = await screen.ensureCameraPermission();
    cameraFocused = granted;
    if (granted) {
      mode = 'expo-camera';
      triggerNotification();
    }
    return granted;
  };

  screen.openManualEntry = () => {
    mode = 'manual';
    cameraFocused = false;
    return mode;
  };

  screen.setManualEntry = (value) => {
    manualEntry = value;
    return manualEntry;
  };

  screen.retry = () => {
    error = null;
    loading = false;
    scanning = true;
    return true;
  };

  screen.submitBarcode = submitScan;

  screen.handleBarcodeDetected = async (value) =>
    screen.submitBarcode(getDetectedValue(value));

  screen.submitManualEntry = async (barcode) =>
    screen.submitBarcode(typeof barcode === 'string' ? barcode : manualEntry);

  screen.openSettings = () => permission === 'denied';

  return screen;
};
