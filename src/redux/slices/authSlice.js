import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { endpoints } from '../../services/api';
import { clearTokens, setTokens } from '../../services/storage';
import { validatePassword } from '../../services/auth';

export const MAX_LOGIN_ATTEMPTS = 5;

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  status: 'idle',
  error: null,
  failedAttempts: 0,
  isLocked: false
};

export const loginUser = createAsyncThunk('auth/loginUser', async (payload) => {
  const response = await endpoints.login(payload);
  await setTokens(response.data);
  return response.data;
});

export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async (payload) => {
    if (!validatePassword(payload.password)) {
      throw new Error('Password does not meet security requirements.');
    }
    const response = await endpoints.signup(payload);
    await setTokens(response.data);
    return response.data;
  }
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  await endpoints.logout();
  await clearTokens();
});

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (payload) => {
    const response = await endpoints.refresh(payload);
    await setTokens(response.data);
    return response.data;
  }
);

export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async (email) => {
    await endpoints.forgotPassword({ email });
    return true;
  }
);

export const confirmPasswordReset = createAsyncThunk(
  'auth/confirmPasswordReset',
  async (payload) => {
    if (!validatePassword(payload.password)) {
      throw new Error('Password does not meet security requirements.');
    }
    await endpoints.resetPassword(payload);
    return true;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.failedAttempts = 0;
        state.isLocked = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
        state.failedAttempts += 1;
        if (state.failedAttempts >= MAX_LOGIN_ATTEMPTS) {
          state.isLocked = true;
        }
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(logoutUser.fulfilled, () => ({ ...initialState }))
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      });
  }
});

export const selectAuthState = (state) => state.auth;
export const selectCurrentUser = (state) => state.auth.user;
export const selectTokens = (state) => ({
  accessToken: state.auth.accessToken,
  refreshToken: state.auth.refreshToken
});
export const selectLockoutState = (state) => ({
  failedAttempts: state.auth.failedAttempts,
  isLocked: state.auth.isLocked
});

export default authSlice.reducer;
