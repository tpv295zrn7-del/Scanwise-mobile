jest.mock('../services/haptic', () => ({
  triggerSuccess: jest.fn(),
  triggerError: jest.fn(),
  triggerNotification: jest.fn()
}));

jest.mock('../services/cameraPermissions', () => ({
  checkCameraPermission: jest.fn(() => Promise.resolve('granted')),
  requestCameraPermission: jest.fn(() => Promise.resolve(true))
}));

import { createStore } from '../redux/store';
import { selectCurrentScan } from '../redux/slices/scansSlice';
import { ScanScreen } from '../screens/ScanScreen';
import { ProductResultScreen } from '../screens/ProductResultScreen';
import { mockScanResponses } from '../services/mockScanResponses';
import * as api from '../services/api';

jest.mock('../services/api', () => ({
  endpoints: {
    login: jest.fn(),
    signup: jest.fn(),
    logout: jest.fn(),
    refresh: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    scanProduct: jest.fn(),
    getAlternatives: jest.fn(),
    submitCorrection: jest.fn()
  }
}));

describe('Barcode scan flow integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('camera to barcode to product result display', async () => {
    api.endpoints.scanProduct.mockResolvedValue({
      data: mockScanResponses.verified
    });
    const store = createStore();
    const navigation = { navigate: jest.fn() };
    const scanScreen = ScanScreen({
      dispatch: store.dispatch,
      navigation,
      initialPermission: 'granted'
    });

    const result = await scanScreen.handleBarcodeDetected([
      { value: mockScanResponses.verified.barcode }
    ]);
    const resultScreen = ProductResultScreen({ scanResult: result });

    expect(selectCurrentScan(store.getState())).toEqual(
      expect.objectContaining({
        barcode: mockScanResponses.verified.barcode,
        name: 'Protein Bar',
        confidence: 'verified'
      })
    );
    expect(navigation.navigate).toHaveBeenCalledWith('ProductResult', {
      scanResult: expect.objectContaining({
        barcode: mockScanResponses.verified.barcode
      })
    });
    expect(resultScreen.productName).toBe('Protein Bar');
    expect(resultScreen.badge.props.bg).toBe('#D1FAE5');
  });
});
