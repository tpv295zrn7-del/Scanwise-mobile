import { configureStore } from '@reduxjs/toolkit';
import correctionsReducer, {
  submitCorrection
} from '../redux/slices/correctionsSlice';
import { CorrectionSubmissionScreen } from '../screens/CorrectionSubmissionScreen';
import { endpoints } from '../services/api';

jest.mock('../services/api', () => ({
  endpoints: {
    submitCorrection: jest.fn()
  }
}));

test('full correction submission flow', async () => {
  endpoints.submitCorrection.mockResolvedValue({ data: { id: 'c1' } });

  const store = configureStore({ reducer: { corrections: correctionsReducer } });

  const screen = CorrectionSubmissionScreen({
    barcode: '5555',
    submitCorrection: (barcode, correction) =>
      store.dispatch(submitCorrection({ barcode, correction }))
  });

  screen.setReason('Wrong product');
  screen.setDetails('Different packaging');

  await screen.submit();

  expect(store.getState().corrections.submitted).toBe(true);
  expect(store.getState().corrections.submissions).toHaveLength(1);
});
