import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './storage';
import { mapErrorCode } from '@/utils/errorMapping';

const BASE_URL = 'https://api.scanwise.app';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const withRetry = async (fn, retries = 3, delay = 150) => {
  let attempt = 0;

  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      attempt += 1;
      const isTimeout = error?.code === 'ECONNABORTED';

      if (!isTimeout || attempt >= retries) {
        throw error;
      }

      await sleep(delay * 2 ** (attempt - 1));
    }
  }

  throw new Error('Retry attempts exhausted');
};

export const toUserError = (error) => {
  const code = error?.response?.data?.code ?? error?.code;
  return mapErrorCode(code, error?.message ?? 'Unknown error');
};

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = 'Bearer ' + token;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error.config ?? {};

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await getRefreshToken();

      if (!refreshToken) {
        await clearTokens();
        throw error;
      }

      try {
        const refreshed = await apiClient.post('/auth/refresh', { refreshToken });
        await setTokens(refreshed.data.accessToken, refreshed.data.refreshToken);
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = 'Bearer ' + refreshed.data.accessToken;
        if (typeof apiClient.request === 'function') {
          return apiClient.request(originalRequest);
        }
        return apiClient.post(originalRequest.url, originalRequest.data, originalRequest);
      } catch (refreshError) {
        await clearTokens();
        throw refreshError;
      }
    }

    throw error;
  }
);

export const authApi = {
  login: (email, password) => withRetry(() => apiClient.post('/auth/login', { email, password })),
  signup: (payload) => withRetry(() => apiClient.post('/auth/signup', payload)),
  logout: (refreshToken) => apiClient.post('/auth/logout', { refreshToken }),
  refresh: (refreshToken) => apiClient.post('/auth/refresh', { refreshToken }),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => apiClient.post('/auth/reset-password', { token, password }),
};

export const profileApi = {
  getProfile: () => apiClient.get('/profile'),
  updateProfile: (payload) => apiClient.put('/profile', payload),
  addFamilyMember: (payload) => apiClient.post('/profile/family', payload),
};

export const onboardingApi = {
  save: (payload) => apiClient.post('/onboarding', payload),
  complete: () => apiClient.post('/onboarding/complete'),
};
