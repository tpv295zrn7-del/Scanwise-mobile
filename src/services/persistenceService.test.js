import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  addSavedItemToCache,
  loadSavedItemsCache,
  removeSavedItemFromCache,
  saveSavedItemsCache,
  syncSavedItemsWithBackend
} from './persistenceService';
import { endpoints } from './api';

jest.mock('./api', () => ({
  endpoints: { getSavedItems: jest.fn() }
}));

describe('persistenceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
  });

  test('load and save cache safely', async () => {
    await expect(loadSavedItemsCache()).resolves.toEqual([]);

    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([{ id: '1' }]));
    await expect(loadSavedItemsCache()).resolves.toEqual([{ id: '1' }]);

    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({ id: 'not-array' }));
    await expect(loadSavedItemsCache()).resolves.toEqual([]);

    AsyncStorage.getItem.mockResolvedValueOnce('bad json');
    await expect(loadSavedItemsCache()).resolves.toEqual([]);

    await saveSavedItemsCache([{ id: '2' }]);
    await saveSavedItemsCache(null);
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  test('add and remove cache items', async () => {
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify([{ id: '1' }]));

    await addSavedItemToCache({ id: '2' });
    await addSavedItemToCache({ id: '2' });
    await removeSavedItemFromCache('1');

    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(3);
  });

  test('syncs cache with backend', async () => {
    endpoints.getSavedItems.mockResolvedValue({ data: [{ id: 'server' }] });

    await expect(syncSavedItemsWithBackend()).resolves.toEqual([{ id: 'server' }]);
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  test('sync fallback to empty array when backend has no data', async () => {
    endpoints.getSavedItems.mockResolvedValueOnce({ data: null });
    await expect(syncSavedItemsWithBackend()).resolves.toEqual([]);
  });
});
