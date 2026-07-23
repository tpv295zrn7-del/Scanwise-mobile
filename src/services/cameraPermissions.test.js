describe('cameraPermissions service', () => {
  const loadModule = () => require('./cameraPermissions');

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('checkCameraPermission returns granted on iOS', async () => {
    jest.doMock('react-native', () => ({
      Platform: { OS: 'ios' },
      PermissionsAndroid: {}
    }));
    jest.doMock('react-native-vision-camera', () => ({
      Camera: {
        getCameraPermissionStatus: jest.fn(() => Promise.resolve('authorized'))
      }
    }));
    jest.doMock('react-native-device-info', () => ({}));

    const { checkCameraPermission } = loadModule();
    await expect(checkCameraPermission()).resolves.toBe('granted');
  });

  test('checkCameraPermission returns denied when Android camera is unavailable', async () => {
    jest.doMock('react-native', () => ({
      Platform: { OS: 'android' },
      PermissionsAndroid: {
        PERMISSIONS: { CAMERA: 'camera' },
        check: jest.fn(() => Promise.resolve(false))
      }
    }));
    jest.doMock('react-native-device-info', () => ({
      hasSystemFeature: jest.fn(() => Promise.resolve(false))
    }));
    jest.doMock('react-native-vision-camera', () => ({
      Camera: {
        getCameraPermissionStatus: jest.fn(() => Promise.resolve('authorized'))
      }
    }));

    const { checkCameraPermission } = loadModule();
    await expect(checkCameraPermission()).resolves.toBe('denied');
  });

  test('requestCameraPermission uses Android permissions result', async () => {
    const request = jest.fn(() => Promise.resolve('granted'));

    jest.doMock('react-native', () => ({
      Platform: { OS: 'android' },
      PermissionsAndroid: {
        PERMISSIONS: { CAMERA: 'camera' },
        RESULTS: { GRANTED: 'granted' },
        request
      }
    }));
    jest.doMock('react-native-device-info', () => ({}));
    jest.doMock('react-native-vision-camera', () => ({
      Camera: {
        requestCameraPermission: jest.fn(() => Promise.resolve('denied'))
      }
    }));

    const { requestCameraPermission } = loadModule();
    await expect(requestCameraPermission()).resolves.toBe(true);
    expect(request).toHaveBeenCalledWith('camera');
  });

  test('requestCameraPermission falls back to camera module on iOS', async () => {
    jest.doMock('react-native', () => ({
      Platform: { OS: 'ios' },
      PermissionsAndroid: {}
    }));
    jest.doMock('react-native-device-info', () => ({}));
    jest.doMock('react-native-vision-camera', () => ({
      Camera: {
        requestCameraPermission: jest.fn(() => Promise.resolve('denied'))
      }
    }));

    const { requestCameraPermission } = loadModule();
    await expect(requestCameraPermission()).resolves.toBe(false);
  });
});
