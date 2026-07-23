import axios from 'axios';
import { endpoints } from './api';
import * as storage from './storage';

jest.mock('./storage', () => ({
  clearTokens: jest.fn(() => Promise.resolve()),
  getAccessToken: jest.fn(() => Promise.resolve('token')),
  getRefreshToken: jest.fn(() => Promise.resolve('refresh')),
  setTokens: jest.fn(() => Promise.resolve())
}));

describe('api service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('request interceptor injects auth header', async () => {
    const cfg = await axios.__instance.__requestHandler({ headers: {} });
    expect(cfg.headers.Authorization).toContain('token');
  });

  test('request interceptor leaves headers when token missing', async () => {
    storage.getAccessToken.mockResolvedValueOnce(null);
    const cfg = await axios.__instance.__requestHandler({ headers: {} });
    expect(cfg.headers.Authorization).toBeUndefined();
  });

  test('response success passthrough', () => {
    const data = { ok: true };
    expect(axios.__instance.__responseSuccess(data)).toEqual(data);
  });

  test('401 triggers refresh and retries request', async () => {
    axios.post.mockResolvedValue({
      data: { accessToken: 'next', refreshToken: 'next-r' }
    });
    axios.__instance.mockResolvedValueOnce({ data: { ok: true } });
    const result = await axios.__instance.__responseFailure({
      response: { status: 401 },
      config: { _retry: false, headers: {} }
    });

    expect(storage.setTokens).toHaveBeenCalled();
    expect(result.data.ok).toBe(true);
  });

  test('refresh failure clears tokens', async () => {
    axios.post.mockRejectedValueOnce(new Error('refresh fail'));
    await expect(
      axios.__instance.__responseFailure({
        response: { status: 401 },
        config: { _retry: false, headers: {} }
      })
    ).rejects.toThrow('refresh fail');
    expect(storage.clearTokens).toHaveBeenCalled();
  });

  test('non-401 response error bubbles', async () => {
    await expect(
      axios.__instance.__responseFailure({
        response: { status: 500 },
        config: {}
      })
    ).rejects.toEqual(expect.objectContaining({ response: { status: 500 } }));
  });

  test('401 already retried does not refresh again', async () => {
    await expect(
      axios.__instance.__responseFailure({
        response: { status: 401 },
        config: { _retry: true, headers: {} }
      })
    ).rejects.toEqual(expect.objectContaining({ response: { status: 401 } }));
  });

  test('endpoint wrappers execute all methods', async () => {
    axios.__instance.post.mockResolvedValue({ data: {} });
    axios.__instance.get.mockResolvedValue({ data: {} });
    axios.__instance.put.mockResolvedValue({ data: {} });

    await endpoints.login({ email: 'a@b.com', password: 'Aa!23456' });
    await endpoints.signup({ email: 'b@c.com', password: 'Aa!23456' });
    await endpoints.logout();
    await endpoints.refresh({ refreshToken: 'x' });
    await endpoints.forgotPassword({ email: 'a@b.com' });
    await endpoints.resetPassword({ token: 't', password: 'Aa!23456' });
    await endpoints.getProfile();
    await endpoints.updateProfile({ goals: [] });

    expect(axios.__instance.post).toHaveBeenCalled();
    expect(axios.__instance.get).toHaveBeenCalled();
    expect(axios.__instance.put).toHaveBeenCalled();
  });

  test('retry and mapped network error', async () => {
    axios.__instance.post
      .mockRejectedValueOnce({ message: 'Network Error' })
      .mockRejectedValueOnce({ message: 'Network Error' })
      .mockRejectedValueOnce({ message: 'Network Error' });

    await expect(
      endpoints.login({ email: 'a@b.com', password: 'Aa!23456' })
    ).rejects.toThrow('Please check your internet connection and retry.');
  });

  test('mapped backend response error', async () => {
    axios.__instance.post.mockRejectedValue({
      response: { data: { code: 'INVALID_CREDENTIALS' } }
    });
    await expect(
      endpoints.login({ email: 'a@b.com', password: 'Aa!23456' })
    ).rejects.toThrow('Invalid email or password.');
  });
});
