import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi, toUserError } from '@/services/api';
import { validatePassword } from '@/services/auth';
import { setTokens, clearTokens, getRefreshToken } from '@/services/storage';

const MAX_LOGIN_ATTEMPTS = 5;

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  loginAttempts: 0,
  lockoutUntil: null,
  passwordResetRequested: false,
};

export const loginUser = createAsyncThunk('auth/loginUser', async ({ email, password }, { getState, rejectWithValue }) => {
  const { auth } = getState();
  if (auth.lockoutUntil && auth.lockoutUntil > Date.now()) {
    return rejectWithValue('Account is temporarily locked.');
  }

  try {
    const response = await authApi.login(email, password);
    await setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  } catch (error) {
    return rejectWithValue(toUserError(error));
  }
});

export const signupUser = createAsyncThunk('auth/signupUser', async ({ email, password, name }, { rejectWithValue }) => {
  const validation = validatePassword(password);
  if (!validation.isValid) {
    return rejectWithValue(validation.errors[0]);
  }

  try {
    const response = await authApi.signup({ email, password, name });
    await setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  } catch (error) {
    return rejectWithValue(toUserError(error));
  }
});

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { getState }) => {
  const refreshToken = getState().auth.refreshToken;

  if (refreshToken) {
    await authApi.logout(refreshToken);
  }

  await clearTokens();
});

export const refreshToken = createAsyncThunk('auth/refreshToken', async (_, { rejectWithValue }) => {
  const storedRefreshToken = await getRefreshToken();

  if (!storedRefreshToken) {
    return rejectWithValue('No refresh token available.');
  }

  try {
    const response = await authApi.refresh(storedRefreshToken);
    await setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  } catch (error) {
    return rejectWithValue(toUserError(error));
  }
});

export const requestPasswordReset = createAsyncThunk('auth/requestPasswordReset', async ({ email }, { rejectWithValue }) => {
  try {
    await authApi.forgotPassword(email);
    return true;
  } catch (error) {
    return rejectWithValue(toUserError(error));
  }
});

export const confirmPasswordReset = createAsyncThunk(
  'auth/confirmPasswordReset',
  async ({ token, password }, { rejectWithValue }) => {
    const validation = validatePassword(password);

    if (!validation.isValid) {
      return rejectWithValue(validation.errors[0]);
    }

    try {
      await authApi.resetPassword(token, password);
      return true;
    } catch (error) {
      return rejectWithValue(toUserError(error));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.loginAttempts = 0;
        state.lockoutUntil = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error.message;
        state.loginAttempts += 1;
        if (state.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
          state.lockoutUntil = Date.now() + 15 * 60 * 1000;
        }
      })
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error.message;
      })
      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error.message;
      })
      .addCase(requestPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.loading = false;
        state.passwordResetRequested = true;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error.message;
      })
      .addCase(confirmPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmPasswordReset.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(confirmPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error.message;
      });
  },
});

export const selectAuthState = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectLoginAttempts = (state) => state.auth.loginAttempts;
export const selectIsLockedOut = (state) => Boolean(state.auth.lockoutUntil && state.auth.lockoutUntil > Date.now());

export default authSlice.reducer;
