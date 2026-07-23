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

  test('focusCamera uses existing granted permission without requesting again', async () => {
    const screen = ScanScreen({ initialPermission: 'granted' });

    await expect(screen.focusCamera()).resolves.toBe(true);
    expect(checkCameraPermission).not.toHaveBeenCalled();
    expect(requestCameraPermission).not.toHaveBeenCalled();
  });

  test('focusCamera reports permission denial', async () => {
    requestCameraPermission.mockResolvedValue(false);
    const screen = ScanScreen();

    await expect(screen.focusCamera()).resolves.toBe(false);
    expect(screen.error).toBe('Camera permission is required to scan products.');
    expect(screen.cameraFocused).toBe(false);
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

  test('empty barcode input triggers validation error', async () => {
    const screen = ScanScreen({ initialPermission: 'granted' });

    await expect(screen.submitBarcode('   ')).resolves.toBeNull();
    expect(screen.error).toBe('Enter a barcode to continue.');
    expect(triggerError).toHaveBeenCalled();
  });

  test('duplicate scans are ignored while already loading', async () => {
    let resolveDispatch;
    const dispatch = jest.fn(
      () =>
        new Promise((resolve) => {
          resolveDispatch = resolve;
        })
    );
    const screen = ScanScreen({ dispatch, initialPermission: 'granted' });

    const pending = screen.submitBarcode('123456');
    await expect(screen.submitBarcode('123456')).resolves.toBeNull();
    resolveDispatch({
      type: 'scans/scanProductByBarcode/fulfilled',
      payload: mockScanResponses.verified
    });
    await pending;
    expect(dispatch).toHaveBeenCalledTimes(1);
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

  test('rawValue barcode payloads are supported', async () => {
    const dispatch = jest.fn(() => Promise.resolve(mockScanResponses.verified));
    const screen = ScanScreen({ dispatch, initialPermission: 'granted' });

    const result = await screen.handleBarcodeDetected({ rawValue: '222222' });

    expect(scanProductByBarcode).toHaveBeenCalledWith('222222');
    expect(result).toEqual(mockScanResponses.verified);
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

  test('requests permission and scans frame with direct scan callback', async () => {
    const directScan = jest
      .fn()
      .mockResolvedValue({ data: { product: { id: 'p1' } } });
    const onHaptic = jest.fn();
    const navigation = { navigate: jest.fn() };

    const screen = ScanScreen({
      scanBarcode: directScan,
      requestCameraPermission: jest.fn().mockResolvedValue('granted'),
      onHaptic,
      navigation
    });

    await expect(screen.requestPermission()).resolves.toBe('granted');
    expect(screen.permission).toBe('granted');
    await screen.processFrame({ barcodes: [{ rawValue: '123456' }] });

    expect(directScan).toHaveBeenCalledWith('123456');
    expect(onHaptic).toHaveBeenCalled();
    expect(navigation.navigate).toHaveBeenCalledWith(
      'ProductResultScreen',
      expect.objectContaining({ barcode: '123456' })
    );
    expect(screen.lastBarcode).toBe('123456');
  });

  test('supports direct manual entry error handling and settings link', async () => {
    const onError = jest.fn();
    const screen = ScanScreen({
      scanBarcode: jest.fn().mockRejectedValue(new Error('network failed')),
      onError
    });

    await screen.submitManualEntry('777');
    expect(screen.error).toBe('network failed');
    expect(onError).toHaveBeenCalled();

    const deniedScreen = ScanScreen({
      requestCameraPermission: jest.fn().mockResolvedValue('denied')
    });
    await deniedScreen.requestPermission();
    expect(deniedScreen.openSettings()).toBe(true);
  });

  test('ignores empty frames and duplicate direct submissions when scan stops', async () => {
    const screen = ScanScreen({
      scanBarcode: jest.fn().mockResolvedValue({ data: {} }),
      requestCameraPermission: jest.fn().mockResolvedValue('granted'),
      cameraAvailable: false
    });

    expect(screen.cameraAvailable).toBe(false);
    await expect(screen.processFrame({ barcodes: [] })).resolves.toBeNull();
    await expect(screen.submitManualEntry()).resolves.toBeNull();

    await screen.submitManualEntry('111');
    await expect(screen.submitManualEntry('222')).resolves.toBeNull();
  });


  test('preserves unknown permission state from injected requester', async () => {
    const screen = ScanScreen({
      requestCameraPermission: jest.fn().mockResolvedValue('unknown')
    });

    await expect(screen.requestPermission()).resolves.toBe('unknown');
    expect(screen.openSettings()).toBe(false);
    expect(screen.error).toBe('Camera permission is required to scan products.');
  });

  test('defaults permission to denied when requester is missing', async () => {
    const navigation = { navigate: jest.fn() };
    const screen = ScanScreen({
      scanBarcode: jest.fn().mockResolvedValue('ok'),
      navigation
    });

    expect(screen.permission).toBe('unknown');
    await expect(screen.requestPermission()).resolves.toBe('denied');
    await screen.submitManualEntry('abc');
    expect(navigation.navigate).toHaveBeenCalledWith(
      'ProductResultScreen',
      expect.objectContaining({ result: 'ok' })
    );
  });
});
