import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'scanwise_onboarding';
const TOTAL_ONBOARDING_STEPS = 5;
const MAX_STEP_INDEX = TOTAL_ONBOARDING_STEPS - 1;
const calculateProgress = (completedCount) =>
  Math.min(1, completedCount / TOTAL_ONBOARDING_STEPS);

// DEV MODE: bypass onboarding for scanner testing — REVERT BEFORE SHIPPING
const initialState = {
  isComplete: true,
  currentStep: MAX_STEP_INDEX,
  completedSteps: [0, 1, 2, 3, 4],
  progress: 1
};

export const saveOnboardingState = createAsyncThunk(
  'onboarding/save',
  async (state) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return state;
  }
);

export const loadOnboardingState = createAsyncThunk(
  'onboarding/load',
  async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : initialState;
  }
);

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setCurrentStep: (state, action) => {
      state.currentStep = Math.max(0, Math.min(MAX_STEP_INDEX, action.payload));
      state.progress = calculateProgress(state.completedSteps.length);
    },
    markStepComplete: (state, action) => {
      if (!state.completedSteps.includes(action.payload)) {
        state.completedSteps.push(action.payload);
      }
      state.progress = calculateProgress(state.completedSteps.length);
    }
  },
  extraReducers: (builder) => {
    builder.addCase(
      loadOnboardingState.fulfilled,
      (_state, action) => action.payload
    );
  }
});

export const { setCurrentStep, markStepComplete } = onboardingSlice.actions;

export const selectOnboardingState = (state) => {
  // Defensive selector: handle both full state and partial state
  return (state && state.onboarding) || state || initialState;
};

export const selectCurrentStep = (state) => {
  const onboardingState = selectOnboardingState(state);
  return (onboardingState && onboardingState.currentStep) || 0;
};

export const selectOnboardingProgress = (state) => {
  const onboardingState = selectOnboardingState(state);
  return (onboardingState && onboardingState.progress) || 0;
};

export const selectCompletedSteps = (state) => {
  const onboardingState = selectOnboardingState(state);
  return (onboardingState && onboardingState.completedSteps) || [];
};

export default onboardingSlice.reducer;
