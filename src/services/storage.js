import AsyncStorage from '@react-native-async-storage/async-storage';
import { decodeToken } from './auth';

const ACCESS_KEY = 'scanwise_access_token';
const REFRESH_KEY = 'scanwise_refresh_token';

export const setTokens = async ({ accessToken, refreshToken }) => {
  await AsyncStorage.setItem(ACCESS_KEY, accessToken);
  await AsyncStorage.setItem(REFRESH_KEY, refreshToken);
};

export const getAccessToken = () => AsyncStorage.getItem(ACCESS_KEY);
export const getRefreshToken = () => AsyncStorage.getItem(REFRESH_KEY);

export const clearTokens = () =>
  AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);

export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return decoded.exp * 1000 <= Date.now();
};
