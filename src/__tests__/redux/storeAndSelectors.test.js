import { store } from '@/redux/store';
import { authSelectors } from '@/redux/selectors/authSelectors';
import { profileSelectors } from '@/redux/selectors/profileSelectors';
import { onboardingSelectors } from '@/redux/selectors/onboardingSelectors';
import { setCurrentStep } from '@/redux/slices/onboardingSlice';

describe('store and selectors', () => {
  it('store initializes and selectors resolve values', () => {
    const state = store.getState();
    expect(authSelectors.user(state)).toBeNull();
    expect(authSelectors.error(state)).toBeNull();
    expect(authSelectors.loading(state)).toBe(false);
    expect(authSelectors.isAuthenticated(state)).toBe(false);
    expect(profileSelectors.profile(state)).toBeNull();
    expect(profileSelectors.familyMembers(state)).toEqual([]);
    expect(profileSelectors.allergies(state)).toEqual([]);
    expect(onboardingSelectors.step(state)).toBe(0);
    expect(onboardingSelectors.progress(state)).toBe(0);
    expect(onboardingSelectors.complete(state)).toBe(false);
  });

  it('store dispatch updates onboarding step', () => {
    store.dispatch(setCurrentStep(3));
    expect(store.getState().onboarding.currentStep).toBe(3);
  });
});
