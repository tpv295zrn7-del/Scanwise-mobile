jest.mock('../services/haptic', () => ({
  triggerSuccess: jest.fn(),
  triggerError: jest.fn(),
  triggerNotification: jest.fn()
}));

jest.mock('../services/cameraPermissions', () => ({
  checkCameraPermission: jest.fn(),
  requestCameraPermission: jest.fn()
}));

jest.mock('../services/mlKitBarcode', () => ({
  detectBarcodesInFrame: jest.fn()
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
import { detectBarcodesInFrame } from '../services/mlKitBarcode';
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
    detectBarcodesInFrame.mockResolvedValue({
      success: true,
      barcode: '1234567890123',
      confidence: 'verified'
    });
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

  test('failed scan uses default message when error is missing', async () => {
    const dispatch = jest.fn(() =>
      Promise.resolve({
        type: 'scans/scanProductByBarcode/rejected',
        error: {}
      })
    );
    const screen = ScanScreen({ dispatch, initialPermission: 'granted' });

    await expect(screen.submitBarcode('000')).resolves.toBeNull();
    expect(screen.error).toBe('Unable to scan product. Please try again.');
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
    expect(result).toEqual(
      expect.objectContaining({
        ...mockScanResponses.verified,
        barcode: '222222'
      })
    );
  });

  test('supports array/object/string barcode extraction', async () => {
    const dispatch = jest.fn(() =>
      Promise.resolve({
        type: 'scans/scanProductByBarcode/fulfilled',
        payload: mockScanResponses.verified
      })
    );
    const screen = ScanScreen({ dispatch, initialPermission: 'granted' });

    await screen.handleBarcodeDetected([{ value: '111' }]);
    screen.retry();
    await screen.handleBarcodeDetected({ rawValue: '222' });
    screen.retry();
    await screen.handleBarcodeDetected('333');

    expect(scanProductByBarcode).toHaveBeenNthCalledWith(1, '111');
    expect(scanProductByBarcode).toHaveBeenNthCalledWith(2, '222');
    expect(scanProductByBarcode).toHaveBeenNthCalledWith(3, '333');
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

    expect(directScan).toHaveBeenCalledWith('1234567890123');
    expect(onHaptic).toHaveBeenCalled();
    expect(navigation.navigate).toHaveBeenCalledWith(
      'ProductResultScreen',
      expect.objectContaining({ barcode: '1234567890123' })
    );
    expect(screen.lastBarcode).toBe('1234567890123');
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

  test('scan callback error uses default message when no error payload exists', async () => {
    const screen = ScanScreen({
      scanBarcode: jest.fn().mockRejectedValue({})
    });

    await screen.submitManualEntry('777');
    expect(screen.error).toBe('Unable to scan product. Please try again.');
  });

  test('ignores empty frames and duplicate direct submissions when scan stops', async () => {
    const screen = ScanScreen({
      scanBarcode: jest.fn().mockResolvedValue({ data: {} }),
      requestCameraPermission: jest.fn().mockResolvedValue('granted'),
      cameraAvailable: false
    });

    expect(screen.cameraAvailable).toBe(false);
    detectBarcodesInFrame.mockResolvedValueOnce({ success: false, reason: 'no_barcode' });
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

  test('frame processing is debounced to one detection per second', async () => {
    let currentTime = 2000;
    const now = () => currentTime;
    const screen = ScanScreen({
      detectBarcodes: detectBarcodesInFrame,
      now,
      dispatch: jest.fn(() =>
        Promise.resolve({
          type: 'scans/scanProductByBarcode/fulfilled',
          payload: mockScanResponses.verified
        })
      ),
      initialPermission: 'granted'
    });

    await screen.processFrame({ frameId: 'a' });
    await screen.processFrame({ frameId: 'b' });
    currentTime = 3100;
    await screen.processFrame({ frameId: 'c' });

    expect(detectBarcodesInFrame).toHaveBeenCalledTimes(2);
  });

  test('processFrame reports camera availability and scan failures', async () => {
    const unavailable = ScanScreen({ cameraAvailable: false });
    await expect(unavailable.processFrame({})).resolves.toBeNull();
    expect(unavailable.error).toBe('Camera not available.');

    detectBarcodesInFrame.mockResolvedValueOnce({
      success: false,
      reason: 'detection_error',
      error: 'native error'
    });
    const screen = ScanScreen();
    await expect(screen.processFrame({})).resolves.toBeNull();
    expect(screen.error).toBe('Scanning failed. Please try again.');
  });

  test('processFrame enriches scan result with ML Kit metadata', async () => {
    detectBarcodesInFrame.mockResolvedValueOnce({
      success: true,
      barcode: '551199',
      confidence: 'verified',
      format: 'EAN_8',
      boundingBox: { x: 10, y: 10, width: 40, height: 20 }
    });
    const navigation = { navigate: jest.fn() };
    const screen = ScanScreen({
      navigation,
      dispatch: jest.fn(() =>
        Promise.resolve({
          type: 'scans/scanProductByBarcode/fulfilled',
          payload: { ...mockScanResponses.verified, confidence: 'estimated' }
        })
      ),
      initialPermission: 'granted'
    });

    await screen.processFrame({});

    expect(screen.currentScan.confidence).toBe('verified');
    expect(screen.currentScan.detection).toEqual(
      expect.objectContaining({ format: 'EAN_8' })
    );
    expect(screen.detectedConfidence).toBe('verified');
    expect(navigation.navigate).toHaveBeenCalledWith('ProductResult', {
      scanResult: expect.objectContaining({ barcode: '551199' })
    });
  });

  test('processFrame is ignored once scanning has stopped', async () => {
    const screen = ScanScreen({
      scanBarcode: jest.fn().mockResolvedValue({ data: {} }),
      requestCameraPermission: jest.fn().mockResolvedValue('granted')
    });

    await screen.submitManualEntry('111');
    await expect(screen.processFrame({})).resolves.toBeNull();
    expect(detectBarcodesInFrame).not.toHaveBeenCalled();
  });

  test('processFrame skips detection while a scan request is loading', async () => {
    let resolveDispatch;
    const screen = ScanScreen({
      dispatch: jest.fn(
        () =>
          new Promise((resolve) => {
            resolveDispatch = resolve;
          })
      ),
      initialPermission: 'granted'
    });

    const pending = screen.submitBarcode('9911');
    await expect(screen.processFrame({})).resolves.toBeNull();
    expect(detectBarcodesInFrame).not.toHaveBeenCalled();

    resolveDispatch({
      type: 'scans/scanProductByBarcode/fulfilled',
      payload: mockScanResponses.verified
    });
    await pending;
  });

  test('processFrame ignores detections without barcode value', async () => {
    detectBarcodesInFrame.mockResolvedValueOnce({
      success: true,
      confidence: 'estimated'
    });
    const screen = ScanScreen();

    await expect(screen.processFrame({})).resolves.toBeNull();
    expect(screen.error).toBeNull();
  });

  test('cancel button model triggers navigation back', () => {
    const goBack = jest.fn();
    const screen = ScanScreen({ navigation: { goBack } });

    screen.cancelButtonModel.onPress();
    expect(goBack).toHaveBeenCalled();
  });

  test('direct scanner result includes detection metadata when provided', async () => {
    detectBarcodesInFrame.mockResolvedValueOnce({
      success: true,
      barcode: '778899',
      confidence: 'verified',
      format: 'CODE_128',
      boundingBox: { x: 0, y: 0, width: 100, height: 20 }
    });
    const screen = ScanScreen({
      scanBarcode: jest.fn().mockResolvedValue({ data: { name: 'Direct Scan' } }),
      requestCameraPermission: jest.fn().mockResolvedValue('granted'),
      initialPermission: 'granted'
    });

    await screen.processFrame({});

    expect(screen.currentScan.detection).toEqual(
      expect.objectContaining({ format: 'CODE_128' })
    );
    expect(screen.cameraPermission).toBe('granted');
    expect(screen.manualEntry).toBe('');
  });

  test('processFrame defaults confidence to estimated when ML Kit omits it', async () => {
    detectBarcodesInFrame.mockResolvedValueOnce({
      success: true,
      barcode: '778800'
    });
    const screen = ScanScreen({
      dispatch: jest.fn(() =>
        Promise.resolve({
          type: 'scans/scanProductByBarcode/fulfilled',
          payload: { barcode: '778800', name: 'Fallback Product' }
        })
      ),
      initialPermission: 'granted'
    });

    await screen.processFrame({});

    expect(screen.detectedConfidence).toBe('estimated');
    expect(screen.currentScan.confidence).toBe('estimated');
  });
});
