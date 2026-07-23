import AsyncStorage from '@react-native-async-storage/async-storage';
import { endpoints } from './api';

const SAVED_ITEMS_KEY = 'scanwise_saved_items';

export const loadSavedItemsCache = async () => {
  const raw = await AsyncStorage.getItem(SAVED_ITEMS_KEY);
  if (!raw) return [];

  try {
    const items = JSON.parse(raw);
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
};

export const saveSavedItemsCache = async (items) => {
  const list = Array.isArray(items) ? items : [];
  await AsyncStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(list));
  return list;
};

export const addSavedItemToCache = async (product) => {
  const items = await loadSavedItemsCache();
  const exists = items.some((item) => item.id === product.id);
  const next = exists ? items : [...items, product];
  await saveSavedItemsCache(next);
  return next;
};

export const removeSavedItemFromCache = async (productId) => {
  const items = await loadSavedItemsCache();
  const next = items.filter((item) => item.id !== productId);
  await saveSavedItemsCache(next);
  return next;
};

export const syncSavedItemsWithBackend = async () => {
  const response = await endpoints.getSavedItems();
  const items = response.data || [];
  await saveSavedItemsCache(items);
  return items;
};
