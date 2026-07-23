import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'scanwise_onboarding';
const TOTAL_ONBOARDING_STEPS = 5;
const MAX_STEP_INDEX = TOTAL_ONBOARDING_STEPS - 1;
const calculateProgress = (completedCount) =>
  Math.min(1, completedCount / TOTAL_ONBOARDING_STEPS);

const initialState = {
  currentStep: 0,
  completedSteps: [],
  progress: 0
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
export const selectOnboardingState = (state) => state.onboarding;
export const selectCurrentStep = (state) => state.onboarding.currentStep;
export const selectOnboardingProgress = (state) => state.onboarding.progress;
export const selectCompletedSteps = (state) => state.onboarding.completedSteps;

export default onboardingSlice.reducer;
