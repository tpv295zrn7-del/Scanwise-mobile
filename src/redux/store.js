import { configureStore } from '@reduxjs/toolkit';
import auth from './slices/authSlice';
import healthProfiles from './slices/healthProfilesSlice';
import onboarding from './slices/onboardingSlice';

export const createStore = () =>
  configureStore({
    reducer: {
      auth,
      healthProfiles,
      onboarding
    }
  });

export const store = createStore();
