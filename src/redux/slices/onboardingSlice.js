import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/utils/constants';

const initialState = {
  currentStep: 0,
  completedSteps: [],
  goals: [],
  allergies: [],
  familyMembers: [],
  isComplete: false,
  loading: false,
  error: null,
};

export const saveOnboardingState = createAsyncThunk('onboarding/saveOnboardingState', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState().onboarding;
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING, JSON.stringify(state));
    return true;
  } catch (_error) {
    return rejectWithValue('Could not save onboarding state.');
  }
});

export const loadOnboardingState = createAsyncThunk('onboarding/loadOnboardingState', async (_, { rejectWithValue }) => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING);
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return rejectWithValue('Could not load onboarding state.');
  }
});

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setCurrentStep: (state, action) => {
      const step = action.payload;
      if (step >= 0 && step <= 5) {
        state.currentStep = step;
      }
    },
    markStepComplete: (state, action) => {
      if (!state.completedSteps.includes(action.payload)) {
        state.completedSteps.push(action.payload);
      }
      if (state.completedSteps.length >= 5) {
        state.isComplete = true;
      }
    },
    updateGoals: (state, action) => {
      state.goals = action.payload;
    },
    updateAllergies: (state, action) => {
      state.allergies = action.payload;
    },
    updateFamilyMembers: (state, action) => {
      state.familyMembers = action.payload;
    },
    resetOnboarding: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveOnboardingState.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveOnboardingState.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(saveOnboardingState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error.message;
      })
      .addCase(loadOnboardingState.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadOnboardingState.fulfilled, (state, action) => {
        if (action.payload) {
          return { ...state, ...action.payload, loading: false, error: null };
        }
        state.loading = false;
        return state;
      })
      .addCase(loadOnboardingState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error.message;
      });
  },
});

export const {
  setCurrentStep,
  markStepComplete,
  updateGoals,
  updateAllergies,
  updateFamilyMembers,
  resetOnboarding,
} = onboardingSlice.actions;

export const selectOnboardingState = (state) => state.onboarding;
export const selectCurrentStep = (state) => state.onboarding.currentStep;
export const selectCompletedSteps = (state) => state.onboarding.completedSteps;
export const selectOnboardingProgress = (state) => (state.onboarding.completedSteps.length / 5) * 100;
export const selectOnboardingComplete = (state) => state.onboarding.isComplete;

export default onboardingSlice.reducer;
