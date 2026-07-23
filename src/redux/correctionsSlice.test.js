import { configureStore } from '@reduxjs/toolkit';
import reducer, {
  addSubmission,
  clearSubmitted,
  selectSubmissionStatus,
  selectSubmissions,
  setError,
  setLoading,
  submitCorrection
} from './slices/correctionsSlice';
import { endpoints } from '../services/api';

jest.mock('../services/api', () => ({
  endpoints: { submitCorrection: jest.fn() }
}));

describe('correctionsSlice', () => {
  const store = () => configureStore({ reducer: { corrections: reducer } });

  test('reducers and selectors', () => {
    const s = store();
    s.dispatch(setLoading(true));
    s.dispatch(setError('bad'));
    s.dispatch(addSubmission({ barcode: '1' }));

    expect(selectSubmissions(s.getState())).toHaveLength(1);
    expect(selectSubmissionStatus(s.getState())).toEqual({
      loading: true,
      error: 'bad',
      submitted: true
    });

    s.dispatch(clearSubmitted());
    expect(selectSubmissionStatus(s.getState()).submitted).toBe(false);
  });

  test('submitCorrection thunk success', async () => {
    endpoints.submitCorrection.mockResolvedValue({ data: { id: 'c1' } });
    const s = store();

    await s.dispatch(
      submitCorrection({ barcode: '123', correction: { reason: 'Wrong barcode' } })
    );

    expect(endpoints.submitCorrection).toHaveBeenCalledWith({
      barcode: '123',
      reason: 'Wrong barcode'
    });
    expect(s.getState().corrections.submitted).toBe(true);
  });

  test('submitCorrection thunk failure', async () => {
    endpoints.submitCorrection.mockRejectedValueOnce(new Error('submission failed'));
    const s = store();

    await s.dispatch(
      submitCorrection({ barcode: '123', correction: { reason: 'Wrong barcode' } })
    );

    expect(s.getState().corrections.error).toBe('submission failed');
  });

  test('submitCorrection falls back to payload when API returns no data', async () => {
    endpoints.submitCorrection.mockResolvedValueOnce({ data: null });
    const s = store();

    await s.dispatch(
      submitCorrection({ barcode: '789', correction: { reason: 'Other' } })
    );

    expect(s.getState().corrections.submissions[0]).toEqual({
      barcode: '789',
      reason: 'Other'
    });
  });
});
