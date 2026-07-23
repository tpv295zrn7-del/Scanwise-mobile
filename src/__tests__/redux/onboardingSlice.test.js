import reducer, {
  setCurrentStep,
  markStepComplete,
  updateGoals,
  updateAllergies,
  updateFamilyMembers,
  resetOnboarding,
  selectOnboardingProgress,
  saveOnboardingState,
  loadOnboardingState,
  selectOnboardingState,
  selectCurrentStep,
  selectCompletedSteps,
  selectOnboardingComplete,
} from '@/redux/slices/onboardingSlice';
import { configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const makeStore = () => configureStore({ reducer: { onboarding: reducer } });

describe('onboardingSlice', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('initial state', () => {
    const state = reducer(undefined, { type: 'init' });
    expect(state.currentStep).toBe(0);
    expect(state.completedSteps).toEqual([]);
  });

  it('step range validation and completion', () => {
    let state = reducer(undefined, setCurrentStep(2));
    expect(state.currentStep).toBe(2);
    state = reducer(state, setCurrentStep(8));
    expect(state.currentStep).toBe(2);

    state = reducer(state, markStepComplete(2));
    state = reducer(state, markStepComplete(2));
    expect(state.completedSteps).toEqual([2]);

    state = reducer(state, markStepComplete(1));
    state = reducer(state, markStepComplete(3));
    state = reducer(state, markStepComplete(4));
    state = reducer(state, markStepComplete(5));
    expect(state.isComplete).toBe(true);
  });

  it('updates and reset', () => {
    let state = reducer(undefined, updateGoals(['g']));
    state = reducer(state, updateAllergies(['a']));
    state = reducer(state, updateFamilyMembers(['f']));
    expect(state.goals).toEqual(['g']);
    state = reducer(state, resetOnboarding());
    expect(state.goals).toEqual([]);
  });

  it('selector computes progress', () => {
    const root = { onboarding: { completedSteps: [1, 2], isComplete: false } };
    expect(selectOnboardingProgress(root)).toBe(40);
  });

  it('persistence save/load', async () => {
    const store = makeStore();
    AsyncStorage.setItem.mockResolvedValue();
    await store.dispatch(saveOnboardingState());
    expect(AsyncStorage.setItem).toHaveBeenCalled();

    AsyncStorage.getItem.mockResolvedValue(JSON.stringify({ currentStep: 4, completedSteps: [1] }));
    await store.dispatch(loadOnboardingState());
    expect(store.getState().onboarding.currentStep).toBe(4);

    AsyncStorage.getItem.mockResolvedValue(null);
    await store.dispatch(loadOnboardingState());
    expect(store.getState().onboarding.loading).toBe(false);

    AsyncStorage.setItem.mockRejectedValueOnce(new Error('fail'));
    const saveFail = await store.dispatch(saveOnboardingState());
    expect(saveFail.type).toContain('rejected');

    AsyncStorage.getItem.mockRejectedValueOnce(new Error('fail'));
    const loadFail = await store.dispatch(loadOnboardingState());
    expect(loadFail.type).toContain('rejected');
  });

  it('selectors expose state slices', () => {
    const root = {
      onboarding: {
        currentStep: 1,
        completedSteps: [1],
        isComplete: false,
      },
    };
    expect(selectOnboardingState(root).currentStep).toBe(1);
    expect(selectCurrentStep(root)).toBe(1);
    expect(selectCompletedSteps(root)).toEqual([1]);
    expect(selectOnboardingComplete(root)).toBe(false);
  });
});
