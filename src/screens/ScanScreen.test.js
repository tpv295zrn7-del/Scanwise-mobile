import { ScanScreen } from './ScanScreen';

describe('ScanScreen', () => {
  test('requests permission and scans frame', async () => {
    const scanBarcode = jest.fn().mockResolvedValue({ data: { product: { id: 'p1' } } });
    const onHaptic = jest.fn();
    const navigation = { navigate: jest.fn() };

    const screen = ScanScreen({
      scanBarcode,
      requestCameraPermission: jest.fn().mockResolvedValue('granted'),
      onHaptic,
      navigation
    });

    await expect(screen.requestPermission()).resolves.toBe('granted');
    expect(screen.permission).toBe('granted');
    await screen.processFrame({ barcodes: [{ rawValue: '123456' }] });

    expect(scanBarcode).toHaveBeenCalledWith('123456');
    expect(onHaptic).toHaveBeenCalled();
    expect(navigation.navigate).toHaveBeenCalledWith(
      'ProductResultScreen',
      expect.objectContaining({ barcode: '123456' })
    );
    expect(screen.lastBarcode).toBe('123456');
  });

  test('supports manual entry fallback and error handling', async () => {
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

  test('ignores empty frames and duplicate submissions when scan stops', async () => {
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
