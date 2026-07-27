import { configureStore } from '@reduxjs/toolkit';
import auth from './slices/authSlice';
import healthProfiles from './slices/healthProfilesSlice';
import onboarding from './slices/onboardingSlice';
import scans from './slices/scansSlice';
import alternatives from './slices/alternativesSlice';
import savedItems from './slices/savedItemsSlice';
import corrections from './slices/correctionsSlice';
import scan from './slices/scanSlice';

export const createStore = () => {
  // Survive Metro Fast Refresh: global persists across module re-evaluations
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

// Debug: monitor saved items state
if (typeof store.subscribe === 'function') {
  store.subscribe(() => {
    const s = store.getState();
    console.log('[SAVE-DEBUG] Store updated — savedItems:', s.savedItems?.items?.length, 'scans.savedScans:', s.scans?.savedScans?.length);
  });
}
