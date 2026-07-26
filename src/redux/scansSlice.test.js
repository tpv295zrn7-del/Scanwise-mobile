import { configureStore } from '@reduxjs/toolkit';
import reducer, {
  addToHistory,
  clearError,
  saveScan,
  selectCurrentScan,
  selectScanHistory,
  selectSavedScans,
  selectIsScanSaved,
  selectScansError,
  selectScansLoading,
  setCurrentScan
} from './slices/scansSlice';
import {
  normalizeScanConfidence,
  scanProductByBarcode
} from './thunks/scanThunk';
import { mockScanResponses } from '../services/mockScanResponses';
import * as api from '../services/api';

jest.mock('../services/api', () => ({
  endpoints: {
    scanProduct: jest.fn()
  }
}));

describe('scansSlice', () => {
  const createStore = () => configureStore({ reducer: { scans: reducer } });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initial state', () => {
    const store = createStore();
    expect(store.getState().scans).toEqual({
      currentScan: null,
      scanHistory: [],
      savedScans: [],
      loading: false,
      error: null,
      productLoading: false,
      productData: null,
      productError: null,
      productNotFound: false,
    });
  });

  test('scanProductByBarcode handles success and selectors', async () => {
    api.endpoints.scanProduct.mockResolvedValue({
      data: { ...mockScanResponses.verified, status: 'success' }
    });
    const store = createStore();

    const action = await store.dispatch(scanProductByBarcode('0123456789012'));

    expect(action.type).toContain('fulfilled');
    expect(selectCurrentScan(store.getState())).toEqual(
      expect.objectContaining({
        confidence: 'verified',
        barcode: '0123456789012'
      })
    );
    expect(selectScanHistory(store.getState())).toHaveLength(1);
    expect(selectScansLoading(store.getState())).toBe(false);
  });

  test('scanProductByBarcode handles rejection', async () => {
    api.endpoints.scanProduct.mockRejectedValue(new Error('lookup failed'));
    const store = createStore();

    const action = await store.dispatch(scanProductByBarcode('missing'));

    expect(action.type).toContain('rejected');
    expect(selectScansError(store.getState())).toBe('lookup failed');
  });

  test('setCurrentScan, addToHistory, clearError, and confidence normalization', () => {
    const store = createStore();

    store.dispatch(setCurrentScan(mockScanResponses.estimated));
    store.dispatch(addToHistory(mockScanResponses.incomplete));
    store.dispatch(addToHistory(null));
    store.dispatch(clearError());

    expect(selectCurrentScan(store.getState())).toEqual(
      mockScanResponses.estimated
    );
    expect(selectScanHistory(store.getState())[0]).toEqual(
      mockScanResponses.incomplete
    );
    expect(normalizeScanConfidence('partial')).toBe('estimated');
    expect(normalizeScanConfidence('found')).toBe('verified');
    expect(normalizeScanConfidence('unknown')).toBe('incomplete');
  });

  test('saveScan adds to savedScans and selectSavedScans / selectIsScanSaved work', () => {
    const store = createStore();
    const scan = {
      barcode: '123456789',
      productName: 'Test Product',
      brand: 'Test Brand',
      image: 'https://example.com/img.jpg',
      nutriscore: 'a',
      category: 'Snacks',
    };

    store.dispatch(saveScan(scan));

    const saved = selectSavedScans(store.getState());
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      barcode: '123456789',
      productName: 'Test Product',
      brand: 'Test Brand',
      image: 'https://example.com/img.jpg',
      nutriscore: 'a',
      category: 'Snacks',
    });
    expect(saved[0].timestamp).toBeDefined();
    expect(selectIsScanSaved('123456789')(store.getState())).toBe(true);
    expect(selectIsScanSaved('999999999')(store.getState())).toBe(false);
  });

  test('saveScan does not duplicate the same barcode', () => {
    const store = createStore();
    store.dispatch(saveScan({ barcode: '111', productName: 'First' }));
    store.dispatch(saveScan({ barcode: '111', productName: 'Second' }));
    expect(selectSavedScans(store.getState())).toHaveLength(1);
    expect(selectSavedScans(store.getState())[0].productName).toBe('First');
  });
});
