import { scanProductByBarcode } from '../redux/thunks/scanThunk';
import {
  checkCameraPermission,
  requestCameraPermission
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
  navigation,
  initialPermission = 'unknown'
} = {}) => {
  const screen = {
    illustration: require('../assets/scan-illustration.png'),
    mode: 'scan',
    overlay: 'barcode-detection',
    scanButton: 'Scan Product',
    manualEntryButton: 'Manual Entry',
    cameraView: {
      library: 'react-native-vision-camera',
      scanner: 'vision-camera-code-scanner'
    },
    cameraPermission: initialPermission,
    cameraFocused: false,
    loading: false,
    error: null,
    manualEntry: '',
    detectedBarcode: null,
    currentScan: null
  };

  screen.loadCameraPermission = async () => {
    screen.cameraPermission = await checkCameraPermission();
    return screen.cameraPermission;
  };

  screen.ensureCameraPermission = async () => {
    const permission =
      screen.cameraPermission === 'unknown'
        ? await screen.loadCameraPermission()
        : screen.cameraPermission;

    if (permission === 'granted') {
      return true;
    }

    const granted = await requestCameraPermission();
    screen.cameraPermission = granted ? 'granted' : 'denied';
    if (!granted) {
      screen.error = CAMERA_PERMISSION_ERROR;
    }
    return granted;
  };

  screen.focusCamera = async () => {
    screen.error = null;
    const granted = await screen.ensureCameraPermission();
    screen.cameraFocused = granted;
    if (granted) {
      screen.mode = 'scan';
      triggerNotification();
    }
    return granted;
  };

  screen.openManualEntry = () => {
    screen.mode = 'manual';
    screen.cameraFocused = false;
    return screen.mode;
  };

  screen.setManualEntry = (value) => {
    screen.manualEntry = value;
    return screen.manualEntry;
  };

  screen.retry = () => {
    screen.error = null;
    screen.loading = false;
    return true;
  };

  screen.submitBarcode = async (value) => {
    if (screen.loading) {
      return null;
    }

    const barcode = `${value || ''}`.trim();
    if (!barcode) {
      screen.error = MANUAL_ENTRY_ERROR;
      triggerError();
      return null;
    }

    screen.loading = true;
    screen.error = null;
    screen.detectedBarcode = barcode;
    triggerSuccess();

    const action = await dispatch(scanProductByBarcode(barcode));
    if (!isSuccessfulScan(action)) {
      screen.loading = false;
      screen.error = action?.error?.message || DEFAULT_SCAN_ERROR;
      triggerError();
      return null;
    }

    screen.loading = false;
    screen.currentScan = action.payload || action;
    navigation?.navigate?.('ProductResult', { scanResult: screen.currentScan });
    return screen.currentScan;
  };

  screen.handleBarcodeDetected = async (value) =>
    screen.submitBarcode(getDetectedValue(value));

  screen.submitManualEntry = async () =>
    screen.submitBarcode(screen.manualEntry);

  return screen;
};
