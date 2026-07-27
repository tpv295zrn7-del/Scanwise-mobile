import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from './slices/authSlice';
import healthProfiles from './slices/healthProfilesSlice';
import onboarding from './slices/onboardingSlice';
import scans from './slices/scansSlice';
import alternatives from './slices/alternativesSlice';
import savedItems from './slices/savedItemsSlice';
import corrections from './slices/correctionsSlice';
import scan from './slices/scanSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['savedItems', 'scans'],
};

const appReducer = combineReducers({
  auth,
  healthProfiles,
  onboarding,
  scans,
  alternatives,
  savedItems,
  corrections,
  scan,
});

const persistedReducer = persistReducer(persistConfig, appReducer);

export const createStore = () =>
  configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });
