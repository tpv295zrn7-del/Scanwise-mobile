import { configureStore } from '@reduxjs/toolkit';
import savedItemsReducer, {
  addToSavedItems,
  fetchSavedItems,
  removeSavedItem
} from '../redux/slices/savedItemsSlice';
import { endpoints } from '../services/api';
import * as persistence from '../services/persistenceService';

jest.mock('../services/api', () => ({
  endpoints: {
    getSavedItems: jest.fn(),
    addSavedItem: jest.fn(),
    removeSavedItem: jest.fn()
  }
}));

jest.mock('../services/persistenceService', () => ({
  loadSavedItemsCache: jest.fn(),
  saveSavedItemsCache: jest.fn(() => Promise.resolve()),
  addSavedItemToCache: jest.fn(() => Promise.resolve()),
  removeSavedItemFromCache: jest.fn(() => Promise.resolve())
}));

test('full save flow', async () => {
  persistence.loadSavedItemsCache.mockResolvedValue([]);
  endpoints.getSavedItems.mockResolvedValue({ data: [] });
  endpoints.addSavedItem.mockResolvedValue({ data: { id: 'p1', name: 'Item' } });
  endpoints.removeSavedItem.mockResolvedValue({ data: {} });

  const store = configureStore({ reducer: { savedItems: savedItemsReducer } });

  await store.dispatch(fetchSavedItems());
  await store.dispatch(addToSavedItems({ id: 'p1', name: 'Item' }));
  expect(store.getState().savedItems.items).toHaveLength(1);

  await store.dispatch(removeSavedItem('p1'));
  expect(store.getState().savedItems.items).toHaveLength(0);
});
