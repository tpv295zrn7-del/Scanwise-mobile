jest.mock('../services/haptic', () => ({
  triggerSuccess: jest.fn(),
  triggerError: jest.fn(),
  triggerNotification: jest.fn()
}));

jest.mock('../services/cameraPermissions', () => ({
  checkCameraPermission: jest.fn(),
  requestCameraPermission: jest.fn()
}));

jest.mock('../redux/thunks/scanThunk', () => ({
  scanProductByBarcode: jest.fn((barcode) => ({
    type: 'scans/scanProductByBarcode',
    meta: { barcode }
  }))
}));

import { ScanScreen } from './ScanScreen';
import { mockScanResponses } from '../services/mockScanResponses';
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

describe('ScanScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    checkCameraPermission.mockResolvedValue('denied');
    requestCameraPermission.mockResolvedValue(true);
  });

  test('camera permission flow focuses camera after request', async () => {
    const screen = ScanScreen();

    await expect(screen.focusCamera()).resolves.toBe(true);
    expect(checkCameraPermission).toHaveBeenCalled();
    expect(requestCameraPermission).toHaveBeenCalled();
    expect(screen.cameraFocused).toBe(true);
    expect(triggerNotification).toHaveBeenCalled();
  });

  test('barcode detection triggers scan dispatch and success haptic', async () => {
    const dispatch = jest.fn(() =>
      Promise.resolve({
        type: 'scans/scanProductByBarcode/fulfilled',
        payload: mockScanResponses.verified
      })
    );
    const screen = ScanScreen({ dispatch, initialPermission: 'granted' });

    await screen.handleBarcodeDetected([{ value: '0123456789012' }]);

    expect(scanProductByBarcode).toHaveBeenCalledWith('0123456789012');
    expect(triggerSuccess).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalled();
    expect(screen.detectedBarcode).toBe('0123456789012');
  });

  test('loading state displays while scan request is in flight', async () => {
    let resolveDispatch;
    const dispatch = jest.fn(
      () =>
        new Promise((resolve) => {
          resolveDispatch = resolve;
        })
    );
    const screen = ScanScreen({ dispatch, initialPermission: 'granted' });

    const pending = screen.submitBarcode('123456');
    expect(screen.loading).toBe(true);

    resolveDispatch({
      type: 'scans/scanProductByBarcode/fulfilled',
      payload: mockScanResponses.verified
    });
    await pending;
    expect(screen.loading).toBe(false);
  });

  test('error handling allows retry after failed scan', async () => {
    const dispatch = jest.fn(() =>
      Promise.resolve({
        type: 'scans/scanProductByBarcode/rejected',
        error: { message: 'Product not found' }
      })
    );
    const screen = ScanScreen({ dispatch, initialPermission: 'granted' });

    await expect(screen.submitBarcode('000')).resolves.toBeNull();
    expect(screen.error).toBe('Product not found');
    expect(triggerError).toHaveBeenCalled();
    expect(screen.retry()).toBe(true);
    expect(screen.error).toBeNull();
  });

  test('manual entry fallback submits typed barcode', async () => {
    const dispatch = jest.fn(() =>
      Promise.resolve({
        type: 'scans/scanProductByBarcode/fulfilled',
        payload: mockScanResponses.estimated
      })
    );
    const screen = ScanScreen({ dispatch, initialPermission: 'granted' });

    expect(screen.openManualEntry()).toBe('manual');
    screen.setManualEntry('0987654321098');
    await screen.submitManualEntry();

    expect(scanProductByBarcode).toHaveBeenCalledWith('0987654321098');
    expect(screen.currentScan).toEqual(mockScanResponses.estimated);
  });

  test('navigates to ProductResultScreen on successful scan', async () => {
    const navigation = { navigate: jest.fn() };
    const dispatch = jest.fn(() =>
      Promise.resolve({
        type: 'scans/scanProductByBarcode/fulfilled',
        payload: mockScanResponses.verified
      })
    );
    const screen = ScanScreen({
      dispatch,
      navigation,
      initialPermission: 'granted'
    });

    await screen.submitBarcode(mockScanResponses.verified.barcode);

    expect(navigation.navigate).toHaveBeenCalledWith('ProductResult', {
      scanResult: mockScanResponses.verified
    });
  });
});
