import { configureStore } from '@reduxjs/toolkit';
import auth from './slices/authSlice';
import healthProfiles from './slices/healthProfilesSlice';
import onboarding from './slices/onboardingSlice';
import scans from './slices/scansSlice';

export const createStore = () =>
  configureStore({
    reducer: {
      auth,
      healthProfiles,
      onboarding,
      scans
    }
  });

export const store = createStore();
