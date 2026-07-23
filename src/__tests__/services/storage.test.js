import AsyncStorage from '@react-native-async-storage/async-storage';
import { setTokens, getAccessToken, getRefreshToken, clearTokens, isTokenExpired } from '@/services/storage';

describe('storage service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('sets/gets/clears tokens', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('a').mockResolvedValueOnce('r');
    await setTokens('a', 'r');
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2);
    expect(await getAccessToken()).toBe('a');
    expect(await getRefreshToken()).toBe('r');
    await clearTokens();
    expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(2);
  });

  it('checks expiry', () => {
    const future = `x.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 1000 })).toString('base64')}.y`;
    const past = `x.${Buffer.from(JSON.stringify({ exp: 1 })).toString('base64')}.y`;
    expect(isTokenExpired(future)).toBe(false);
    expect(isTokenExpired(past)).toBe(true);
    expect(isTokenExpired('bad')).toBe(true);
  });
});
