import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  setTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
  isTokenExpired
} from './storage';
import { decodeToken } from './auth';

jest.mock('./auth', () => ({
  decodeToken: jest.fn(() => ({ exp: Math.floor(Date.now() / 1000) + 1000 }))
}));

test('storage token methods and expiry', async () => {
  await setTokens({ accessToken: 'a', refreshToken: 'b' });
  await getAccessToken();
  await getRefreshToken();
  await clearTokens();
  expect(AsyncStorage.setItem).toHaveBeenCalled();
  expect(isTokenExpired('token')).toBe(false);
  decodeToken.mockReturnValueOnce({
    exp: Math.floor(Date.now() / 1000) - 1000
  });
  expect(isTokenExpired('expired')).toBe(true);
  decodeToken.mockReturnValueOnce(null);
  expect(isTokenExpired('invalid')).toBe(true);
});
