import { configureStore } from '@reduxjs/toolkit';
import reducer, {
  addItem,
  addToSavedItems,
  clearError,
  fetchSavedItems,
  removeItem,
  removeSavedItem,
  selectIsSaved,
  selectSavedItems,
  setSavedItems
} from './slices/savedItemsSlice';
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

describe('savedItemsSlice', () => {
  const store = () => configureStore({ reducer: { savedItems: reducer } });

  beforeEach(() => {
    jest.clearAllMocks();
    persistence.loadSavedItemsCache.mockResolvedValue([]);
  });

  test('reducers and selectors', () => {
    const s = store();
    s.dispatch(setSavedItems([{ id: '1' }]));
    s.dispatch(addItem({ id: '2' }));
    s.dispatch(addItem({ id: '2' }));
    s.dispatch(removeItem('1'));
    s.dispatch(clearError());

    expect(selectSavedItems(s.getState())).toEqual([{ id: '2' }]);
    expect(selectIsSaved('2')(s.getState())).toBe(true);
    expect(selectIsSaved('1')(s.getState())).toBe(false);

    s.dispatch(setSavedItems(null));
    expect(selectSavedItems(s.getState())).toEqual([]);
  });

  test('fetchSavedItems uses cache and schedules sync', async () => {
    persistence.loadSavedItemsCache.mockResolvedValue([{ id: 'cached' }]);
    endpoints.getSavedItems.mockResolvedValue({ data: [{ id: 'fresh' }] });

    const s = store();
    await s.dispatch(fetchSavedItems());

    expect(s.getState().savedItems.items[0].id).toBe('cached');
    expect(endpoints.getSavedItems).toHaveBeenCalled();
  });

  test('fetchSavedItems tolerates background sync errors when cache exists', async () => {
    persistence.loadSavedItemsCache.mockResolvedValue([{ id: 'cached' }]);
    endpoints.getSavedItems.mockRejectedValueOnce(new Error('sync failed'));

    const s = store();
    await s.dispatch(fetchSavedItems());

    expect(s.getState().savedItems.items).toEqual([{ id: 'cached' }]);
  });

  test('fetchSavedItems cached branch normalizes empty background payload', async () => {
    persistence.loadSavedItemsCache.mockResolvedValue([{ id: 'cached' }]);
    endpoints.getSavedItems.mockResolvedValueOnce({ data: null });

    const s = store();
    await s.dispatch(fetchSavedItems());

    expect(persistence.saveSavedItemsCache).toHaveBeenCalledWith([]);
  });

  test('add/remove/fetch thunks', async () => {
    endpoints.getSavedItems.mockResolvedValue({ data: [{ id: '1' }] });
    endpoints.addSavedItem.mockResolvedValue({ data: { id: '2' } });
    endpoints.removeSavedItem.mockResolvedValue({ data: {} });

    const s = store();
    await s.dispatch(fetchSavedItems());
    await s.dispatch(addToSavedItems({ id: '2' }));
    await s.dispatch(addToSavedItems({ id: '2' }));
    await s.dispatch(removeSavedItem('1'));

    expect(persistence.addSavedItemToCache).toHaveBeenCalledWith({ id: '2' });
    expect(persistence.removeSavedItemFromCache).toHaveBeenCalledWith('1');
    expect(s.getState().savedItems.items.map((item) => item.id)).toEqual(['2']);
  });

  test('thunk errors are stored', async () => {
    endpoints.addSavedItem.mockRejectedValueOnce(new Error('save failed'));

    const s = store();
    await s.dispatch(addToSavedItems({ id: 'x' }));

    expect(s.getState().savedItems.error).toBe('save failed');
  });

  test('fetches backend when cache empty and handles remove failure', async () => {
    persistence.loadSavedItemsCache.mockResolvedValueOnce([]);
    endpoints.getSavedItems.mockResolvedValueOnce({ data: null });
    endpoints.removeSavedItem.mockRejectedValueOnce(new Error('remove failed'));

    const s = store();
    await s.dispatch(fetchSavedItems());
    await s.dispatch(removeSavedItem('9'));

    expect(s.getState().savedItems.items).toEqual([]);
    expect(s.getState().savedItems.error).toBe('remove failed');
  });

  test('handles fetch failure and add fallback payload', async () => {
    persistence.loadSavedItemsCache.mockResolvedValueOnce([]);
    endpoints.getSavedItems.mockRejectedValueOnce(new Error('fetch failed'));
    endpoints.addSavedItem.mockResolvedValueOnce({ data: null });

    const s = store();
    await s.dispatch(fetchSavedItems());
    expect(s.getState().savedItems.error).toBe('fetch failed');
    await s.dispatch(addToSavedItems({ id: 'fallback' }));

    expect(s.getState().savedItems.error).toBeNull();
    expect(s.getState().savedItems.items).toEqual([{ id: 'fallback' }]);
  });
});
