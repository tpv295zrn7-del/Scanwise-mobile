import AsyncStorage from '@react-native-async-storage/async-storage';
import { decodeToken } from './auth';
import { STORAGE_KEYS } from '@/utils/constants';

export const setTokens = async (accessToken, refreshToken) => {
  await Promise.all([
    AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
    AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
  ]);
};

export const getAccessToken = async () => AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

export const getRefreshToken = async () => AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

export const clearTokens = async () => {
  await Promise.all([
    AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
    AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
  ]);
};

export const isTokenExpired = (token) => {
  const payload = decodeToken(token);
  if (!payload?.exp) {
    return true;
  }

  return payload.exp * 1000 <= Date.now();
};
