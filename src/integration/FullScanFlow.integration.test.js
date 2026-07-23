import { ScanScreen } from '../screens/ScanScreen';

test('complete scan flow navigates to product result', async () => {
  const scanBarcode = jest.fn().mockResolvedValue({
    data: { product: { id: 'prod-1', name: 'Scanned Item' }, confidence: 'verified' }
  });
  const navigation = { navigate: jest.fn() };
  const onHaptic = jest.fn();

  const screen = ScanScreen({
    scanBarcode,
    requestCameraPermission: jest.fn().mockResolvedValue('granted'),
    navigation,
    onHaptic
  });

  await screen.requestPermission();
  await screen.processFrame({ barcodes: [{ rawValue: '009988' }] });

  expect(screen.scanning).toBe(false);
  expect(scanBarcode).toHaveBeenCalledWith('009988');
  expect(onHaptic).toHaveBeenCalled();
  expect(navigation.navigate).toHaveBeenCalledWith(
    'ProductResultScreen',
    expect.objectContaining({ barcode: '009988' })
  );
});
