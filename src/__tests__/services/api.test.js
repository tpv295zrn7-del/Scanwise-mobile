const buildApi = () => {
  jest.resetModules();

  const mockClient = {
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    request: jest.fn(),
  };

  jest.doMock('axios', () => ({
    create: jest.fn(() => mockClient),
  }));

  jest.doMock('@/services/storage', () => ({
    getAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
  }));

  const api = require('@/services/api');
  const storage = require('@/services/storage');
  return { api, storage, mockClient };
};

describe('api service', () => {
  it('withRetry retries timeout and throws after retries', async () => {
    const { api } = buildApi();
    const fn = jest.fn().mockRejectedValueOnce({ code: 'ECONNABORTED' }).mockResolvedValueOnce('ok');
    await expect(api.withRetry(fn, 2, 1)).resolves.toBe('ok');

    const fail = jest.fn().mockRejectedValue({ code: 'ECONNABORTED' });
    await expect(api.withRetry(fail, 1, 1)).rejects.toEqual({ code: 'ECONNABORTED' });
  });

  it('toUserError maps backend code and fallback', () => {
    const { api } = buildApi();
    expect(api.toUserError({ response: { data: { code: 'INVALID_CREDENTIALS' } } })).toContain('incorrect');
    expect(api.toUserError({ message: 'Oops' })).toBe('Oops');
  });

  it('request interceptor attaches auth header', async () => {
    const { storage, mockClient } = buildApi();
    storage.getAccessToken.mockResolvedValue('abc-token');
    const requestHandler = mockClient.interceptors.request.use.mock.calls[0][0];
    const config = await requestHandler({ headers: {} });
    expect(config.headers.Authorization).toContain('abc-token');
  });

  it('response interceptor refreshes token and retries request', async () => {
    const { storage, mockClient } = buildApi();
    const errorHandler = mockClient.interceptors.response.use.mock.calls[0][1];

    storage.getRefreshToken.mockResolvedValue('refresh-token');
    mockClient.post.mockResolvedValueOnce({ data: { accessToken: 'newA', refreshToken: 'newR' } });
    mockClient.request.mockResolvedValueOnce({ ok: true });

    const result = await errorHandler({ response: { status: 401 }, config: { headers: {}, url: '/x', data: {} } });
    expect(storage.setTokens).toHaveBeenCalledWith('newA', 'newR');
    expect(result).toEqual({ ok: true });
  });

  it('response interceptor clears tokens when refresh flow fails', async () => {
    const { storage, mockClient } = buildApi();
    const errorHandler = mockClient.interceptors.response.use.mock.calls[0][1];

    storage.getRefreshToken.mockResolvedValue(null);
    await expect(errorHandler({ response: { status: 401 }, config: {} })).rejects.toBeDefined();
    expect(storage.clearTokens).toHaveBeenCalled();
  });

  it('endpoint wrappers invoke underlying client', () => {
    const { api, mockClient } = buildApi();
    api.authApi.login('a', 'b');
    api.authApi.signup({});
    api.authApi.logout('r');
    api.authApi.refresh('r');
    api.authApi.forgotPassword('a');
    api.authApi.resetPassword('t', 'p');
    api.profileApi.getProfile();
    api.profileApi.updateProfile({});
    api.profileApi.addFamilyMember({});
    api.onboardingApi.save({});
    api.onboardingApi.complete();

    expect(mockClient.post).toHaveBeenCalled();
    expect(mockClient.get).toHaveBeenCalled();
    expect(mockClient.put).toHaveBeenCalled();
  });
});
