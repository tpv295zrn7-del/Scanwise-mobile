import { configureStore } from '@reduxjs/toolkit';
import alternativesReducer, {
  alternativesThunk,
  setSelectedAlternative
} from '../redux/slices/alternativesSlice';
import scanReducer, { setCurrentScan } from '../redux/slices/scanSlice';
import { ProductResultScreen } from '../screens/ProductResultScreen';
import { endpoints } from '../services/api';

jest.mock('../services/api', () => ({
  endpoints: {
    getAlternatives: jest.fn(),
    scanBarcode: jest.fn()
  }
}));

test('full alternatives flow', async () => {
  endpoints.getAlternatives.mockResolvedValue({
    data: [
      { id: 'a1', name: 'Better Option', nutrition: { sugar: 5, sodium: 120 } },
      { id: 'a2', name: 'Option 2', nutrition: { sugar: 8, sodium: 180 } }
    ]
  });

  const store = configureStore({
    reducer: { alternatives: alternativesReducer, scan: scanReducer }
  });

  store.dispatch(
    setCurrentScan({ id: 'orig', nutrition: { sugar: 20, sodium: 300, protein: 2 } })
  );
  await store.dispatch(alternativesThunk('12345'));
  store.dispatch(setSelectedAlternative(0));

  const screen = ProductResultScreen({
    product: store.getState().scan.currentScan,
    alternatives: store.getState().alternatives.list,
    userGoals: ['low_sugar']
  });

  const selected = screen.selectAlternative(0);
  store.dispatch(setCurrentScan(selected));

  expect(screen.alternatives[0].goalMatch).toBe(true);
  expect(store.getState().scan.currentScan.id).toBe('a1');
});
