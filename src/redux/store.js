import { configureStore } from '@reduxjs/toolkit';
import auth from './slices/authSlice';
import healthProfiles from './slices/healthProfilesSlice';
import onboarding from './slices/onboardingSlice';
import alternatives from './slices/alternativesSlice';
import savedItems from './slices/savedItemsSlice';
import corrections from './slices/correctionsSlice';
import scan from './slices/scanSlice';

export const createStore = () =>
  configureStore({
    reducer: {
      auth,
      healthProfiles,
      onboarding,
      alternatives,
      savedItems,
      corrections,
      scan
    }
  });

export const store = createStore();
