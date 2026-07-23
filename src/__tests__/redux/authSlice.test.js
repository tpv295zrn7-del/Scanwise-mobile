import reducer, {
  loginUser,
  signupUser,
  logoutUser,
  refreshToken,
  requestPasswordReset,
  confirmPasswordReset,
  selectIsLockedOut,
} from '@/redux/slices/authSlice';
import { configureStore } from '@reduxjs/toolkit';
import * as api from '@/services/api';
import * as storage from '@/services/storage';

jest.mock('@/services/api');
jest.mock('@/services/storage');

const makeStore = () => configureStore({ reducer: { auth: reducer } });

describe('authSlice', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    api.toUserError.mockReturnValue('Mapped error');
  });

  it('has correct initial state', () => {
    const state = reducer(undefined, { type: 'init' });
    expect(state.isAuthenticated).toBe(false);
    expect(state.loginAttempts).toBe(0);
  });

  it('handles login success', async () => {
    const store = makeStore();
    api.authApi.login.mockResolvedValue({ data: { user: { id: '1', name: 'A' }, accessToken: 'a', refreshToken: 'r' } });
    storage.setTokens.mockResolvedValue();

    await store.dispatch(loginUser({ email: 'a@b.com', password: 'Abcdef1!' }));
    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(true);
    expect(storage.setTokens).toHaveBeenCalled();
  });

  it('increments login attempts and locks after 5 failures', async () => {
    const store = makeStore();
    api.authApi.login.mockRejectedValue(new Error('bad'));

    await store.dispatch(loginUser({ email: 'a@b.com', password: 'x' }));
    await store.dispatch(loginUser({ email: 'a@b.com', password: 'x' }));
    await store.dispatch(loginUser({ email: 'a@b.com', password: 'x' }));
    await store.dispatch(loginUser({ email: 'a@b.com', password: 'x' }));
    await store.dispatch(loginUser({ email: 'a@b.com', password: 'x' }));

    const state = store.getState().auth;
    expect(state.loginAttempts).toBe(5);
    expect(state.lockoutUntil).not.toBeNull();
    expect(selectIsLockedOut({ auth: state })).toBe(true);
  });

  it('rejects login when account is locked', async () => {
    const store = configureStore({
      reducer: { auth: reducer },
      preloadedState: {
        auth: {
          ...reducer(undefined, { type: 'init' }),
          lockoutUntil: Date.now() + 10000,
        },
      },
    });

    const action = await store.dispatch(loginUser({ email: 'a@b.com', password: 'x' }));
    expect(action.type).toContain('rejected');
  });

  it('handles signup weak password failure', async () => {
    const store = makeStore();
    const action = await store.dispatch(signupUser({ email: 'a@b.com', password: 'weak', name: 'A' }));
    expect(action.type).toContain('rejected');
  });

  it('handles signup success', async () => {
    const store = makeStore();
    api.authApi.signup.mockResolvedValue({ data: { user: { id: '1' }, accessToken: 'a', refreshToken: 'r' } });
    storage.setTokens.mockResolvedValue();
    await store.dispatch(signupUser({ email: 'a@b.com', password: 'Strong1!', name: 'A' }));
    expect(store.getState().auth.isAuthenticated).toBe(true);

    api.authApi.signup.mockRejectedValueOnce(new Error('exists'));
    const bad = await store.dispatch(signupUser({ email: 'a@b.com', password: 'Strong1!', name: 'A' }));
    expect(bad.type).toContain('rejected');
  });

  it('logout clears state and tokens', async () => {
    const store = makeStore();
    store.dispatch({
      type: loginUser.fulfilled.type,
      payload: { user: { id: '1' }, accessToken: 'a', refreshToken: 'r' },
    });
    api.authApi.logout.mockResolvedValue({});
    storage.clearTokens.mockResolvedValue();
    await store.dispatch(logoutUser());
    expect(store.getState().auth).toEqual(reducer(undefined, { type: 'init' }));
  });

  it('refresh token success and missing token failure', async () => {
    const store = makeStore();
    storage.getRefreshToken.mockResolvedValue('refresh');
    api.authApi.refresh.mockResolvedValue({ data: { accessToken: 'newa', refreshToken: 'newr' } });
    storage.setTokens.mockResolvedValue();

    await store.dispatch(refreshToken());
    expect(store.getState().auth.accessToken).toBe('newa');

    storage.getRefreshToken.mockResolvedValue(null);
    const action = await store.dispatch(refreshToken());
    expect(action.type).toContain('rejected');

    storage.getRefreshToken.mockResolvedValue('refresh');
    api.authApi.refresh.mockRejectedValueOnce(new Error('expired'));
    const failed = await store.dispatch(refreshToken());
    expect(failed.type).toContain('rejected');
  });

  it('requestPasswordReset + confirmPasswordReset paths', async () => {
    const store = makeStore();
    api.authApi.forgotPassword.mockResolvedValue({});
    await store.dispatch(requestPasswordReset({ email: 'a@b.com' }));
    expect(store.getState().auth.passwordResetRequested).toBe(true);

    api.authApi.resetPassword.mockResolvedValue({});
    await store.dispatch(confirmPasswordReset({ token: 't', password: 'Strong1!' }));

    const bad = await store.dispatch(confirmPasswordReset({ token: 't', password: 'weak' }));
    expect(bad.type).toContain('rejected');

    api.authApi.forgotPassword.mockRejectedValueOnce(new Error('missing'));
    const resetFail = await store.dispatch(requestPasswordReset({ email: 'bad@b.com' }));
    expect(resetFail.type).toContain('rejected');

    api.authApi.resetPassword.mockRejectedValueOnce(new Error('expired'));
    const confirmFail = await store.dispatch(confirmPasswordReset({ token: 't', password: 'Strong1!' }));
    expect(confirmFail.type).toContain('rejected');
  });
});
