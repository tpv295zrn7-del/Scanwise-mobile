jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve())
}));

jest.mock('axios', () => {
  const instance = jest.fn(() => Promise.resolve({ data: {} }));
  instance.interceptors = {
    request: {
      use: jest.fn((handler) => {
        instance.__requestHandler = handler;
      })
    },
    response: {
      use: jest.fn((success, failure) => {
        instance.__responseSuccess = success;
        instance.__responseFailure = failure;
      })
    }
  };
  instance.post = jest.fn();
  instance.get = jest.fn();
  instance.put = jest.fn();
  instance.delete = jest.fn();

  return {
    create: jest.fn(() => instance),
    post: jest.fn(),
    __instance: instance
  };
});
