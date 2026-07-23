import { configureStore } from '@reduxjs/toolkit';
import alternatives from './slices/alternativesSlice';
import auth from './slices/authSlice';
import corrections from './slices/correctionsSlice';
import healthProfiles from './slices/healthProfilesSlice';
import onboarding from './slices/onboardingSlice';
import savedItems from './slices/savedItemsSlice';
import scan from './slices/scanSlice';
import scans from './slices/scansSlice';

export const createStore = () =>
  configureStore({
    reducer: {
      auth,
      healthProfiles,
      onboarding,
      scans,
      alternatives,
      savedItems,
      corrections,
      scan
    }
  });

export const store = createStore();
