import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import healthProfilesReducer from './slices/healthProfilesSlice';
import onboardingReducer from './slices/onboardingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    healthProfiles: healthProfilesReducer,
    onboarding: onboardingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/loginUser/fulfilled', 'auth/signupUser/fulfilled'],
      },
    }),
});
