import { configureStore } from '@reduxjs/toolkit';
import auth from './slices/authSlice';
import healthProfiles from './slices/healthProfilesSlice';
import onboarding from './slices/onboardingSlice';
import scans from './slices/scansSlice';
import alternatives from './slices/alternativesSlice';
import savedItems from './slices/savedItemsSlice';
import corrections from './slices/correctionsSlice';
import scan from './slices/scanSlice';
import { loadSavedItemsCache, saveSavedItemsCache } from '../services/persistenceService';
import { setSavedItems } from './slices/savedItemsSlice';

export const createStore = () => {
  if (global.__REDUX_STORE__) {
    return global.__REDUX_STORE__;
  }

  const store = configureStore({
    reducer: {
      auth,
      healthProfiles,
      onboarding,
      scans,
      alternatives,
      savedItems,
      corrections,
      scan,
    },
  });

  global.__REDUX_STORE__ = store;
  return store;
};

export const store = createStore();

// ── Persistence ──────────────────────────────────────────────
// Hydrate saved items from AsyncStorage on startup
let isHydrated = false;

loadSavedItemsCache().then((items) => {
  if (items && items.length > 0) {
    store.dispatch(setSavedItems(items));
    console.log(`[PERSIST] Hydrated ${items.length} saved items from cache`);
  }
  isHydrated = true;
});

// Auto-persist savedItems to AsyncStorage on every change after hydration
store.subscribe(() => {
  if (!isHydrated) return;

  const s = store.getState();
  const items = s.savedItems?.items ?? [];
  saveSavedItemsCache(items);
  console.log(`[PERSIST] Persisted ${items.length} saved items to cache`);
});
