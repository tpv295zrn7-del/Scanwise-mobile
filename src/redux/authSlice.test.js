import reducer, {
  loginUser,
  signupUser,
  logoutUser,
  refreshToken,
  requestPasswordReset,
  confirmPasswordReset
} from './slices/authSlice';
import { configureStore } from '@reduxjs/toolkit';
import * as api from '../services/api';

jest.mock('../services/api', () => ({
  endpoints: {
    login: jest.fn(),
    signup: jest.fn(),
    logout: jest.fn(),
    refresh: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn()
  }
}));
jest.mock('../services/storage', () => ({
  setTokens: jest.fn(),
  clearTokens: jest.fn()
}));

describe('authSlice', () => {
  const store = () => configureStore({ reducer: { auth: reducer } });
  test('initial state', () =>
    expect(store().getState().auth.failedAttempts).toBe(0));
  test('login success', async () => {
    api.endpoints.login.mockResolvedValue({
      data: { user: { id: '1' }, accessToken: 'a', refreshToken: 'r' }
    });
    await store().dispatch(
      loginUser({ email: 'a@b.com', password: 'Aa!23456' })
    );
  });
  test('lockout after failures', async () => {
    const s = store();
    api.endpoints.login.mockRejectedValue(new Error('bad'));
    for (let i = 0; i < 5; i += 1) await s.dispatch(loginUser({}));
    expect(s.getState().auth.isLocked).toBe(true);
  });
  test('signup/logout/refresh/reset thunks', async () => {
    api.endpoints.signup.mockResolvedValue({
      data: { user: { id: '1' }, accessToken: 'a', refreshToken: 'r' }
    });
    api.endpoints.logout.mockResolvedValue({ data: {} });
    api.endpoints.refresh.mockResolvedValue({
      data: { accessToken: 'n', refreshToken: 'm' }
    });
    api.endpoints.forgotPassword.mockResolvedValue({ data: {} });
    api.endpoints.resetPassword.mockResolvedValue({ data: {} });
    const s = store();
    await s.dispatch(signupUser({ email: 'a@b.com', password: 'Aa!23456' }));
    await s.dispatch(refreshToken({ refreshToken: 'x' }));
    await s.dispatch(requestPasswordReset('a@b.com'));
    await s.dispatch(
      confirmPasswordReset({ token: 't', password: 'Aa!23456' })
    );
    await s.dispatch(logoutUser());
  });
  test('rejects weak password flows', async () => {
    const s = store();
    const signup = await s.dispatch(
      signupUser({ email: 'a@b.com', password: 'weak' })
    );
    const reset = await s.dispatch(
      confirmPasswordReset({ token: 't', password: 'weak' })
    );
    expect(signup.type).toContain('rejected');
    expect(reset.type).toContain('rejected');
  });
});
