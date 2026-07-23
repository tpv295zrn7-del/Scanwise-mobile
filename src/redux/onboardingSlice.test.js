import reducer, {
  setCurrentStep,
  markStepComplete,
  saveOnboardingState,
  loadOnboardingState,
  selectOnboardingProgress
} from './slices/onboardingSlice';
import { configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('onboardingSlice', () => {
  const store = () => configureStore({ reducer: { onboarding: reducer } });
  test('step and progress tracking', () => {
    const s = store();
    s.dispatch(setCurrentStep(10));
    expect(s.getState().onboarding.currentStep).toBe(5);
    s.dispatch(setCurrentStep(-3));
    expect(s.getState().onboarding.currentStep).toBe(0);
    s.dispatch(markStepComplete(1));
    s.dispatch(markStepComplete(1));
    expect(selectOnboardingProgress(s.getState())).toBeGreaterThan(0);
  });
  test('persistence thunks', async () => {
    const s = store();
    await s.dispatch(
      saveOnboardingState({
        currentStep: 1,
        completedSteps: [1],
        progress: 0.2
      })
    );
    AsyncStorage.getItem.mockResolvedValueOnce(
      JSON.stringify({ currentStep: 2, completedSteps: [1, 2], progress: 0.4 })
    );
    await s.dispatch(loadOnboardingState());
    expect(s.getState().onboarding.currentStep).toBe(2);
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    await s.dispatch(loadOnboardingState());
    expect(s.getState().onboarding.currentStep).toBe(0);
  });
});
