import { configureStore } from '@reduxjs/toolkit';
import reducer, {
  clearScanError,
  scanBarcode,
  setCurrentScan,
  selectCurrentScan
} from './slices/scanSlice';
import { endpoints } from '../services/api';

jest.mock('../services/api', () => ({
  endpoints: { scanBarcode: jest.fn() }
}));

describe('scanSlice', () => {
  const store = () => configureStore({ reducer: { scan: reducer } });

  test('reducers and selectors', () => {
    const s = store();
    s.dispatch(setCurrentScan({ id: 'a' }));
    expect(selectCurrentScan(s.getState()).id).toBe('a');
    s.dispatch(clearScanError());
    expect(s.getState().scan.error).toBeNull();
  });

  test('scanBarcode thunk success and failure', async () => {
    endpoints.scanBarcode.mockResolvedValueOnce({ data: { product: { id: 'p1' } } });
    endpoints.scanBarcode.mockRejectedValueOnce(new Error('scan failed'));

    const s = store();
    await s.dispatch(scanBarcode('123'));
    expect(s.getState().scan.scannedBarcode).toBe('123');

    await s.dispatch(scanBarcode('999'));
    expect(s.getState().scan.error).toBe('scan failed');
  });
});
