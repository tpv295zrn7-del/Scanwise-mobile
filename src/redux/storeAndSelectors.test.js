import { createStore } from './store';
import * as authSelectors from './selectors/authSelectors';
import * as profileSelectors from './selectors/profileSelectors';
import * as onboardingSelectors from './selectors/onboardingSelectors';

test('store initializes and selectors export', () => {
  const store = createStore();
  const state = store.getState();
  expect(authSelectors.selectAuthState(state)).toBeTruthy();
  expect(profileSelectors.selectHealthProfile(state)).toBeTruthy();
  expect(onboardingSelectors.selectOnboardingState(state)).toBeTruthy();
});
