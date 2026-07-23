import { configureStore } from '@reduxjs/toolkit';
import authReducer, { signupUser } from '../redux/slices/authSlice';
import onboardingReducer, {
  markStepComplete
} from '../redux/slices/onboardingSlice';
import * as api from '../services/api';

jest.mock('../services/api', () => ({ endpoints: { signup: jest.fn() } }));
jest.mock('../services/storage', () => ({
  setTokens: jest.fn(),
  clearTokens: jest.fn()
}));

test('signup onboarding to home state', async () => {
  api.endpoints.signup.mockResolvedValue({
    data: { user: { id: '1', name: 'A' }, accessToken: 'a', refreshToken: 'r' }
  });
  const store = configureStore({
    reducer: { auth: authReducer, onboarding: onboardingReducer }
  });
  await store.dispatch(signupUser({ email: 'a@b.com', password: 'Aa!23456' }));
  store.dispatch(markStepComplete(1));
  store.dispatch(markStepComplete(2));
  store.dispatch(markStepComplete(3));
  store.dispatch(markStepComplete(4));
  store.dispatch(markStepComplete(5));
  expect(store.getState().auth.user.id).toBe('1');
  expect(store.getState().onboarding.progress).toBe(1);
});
