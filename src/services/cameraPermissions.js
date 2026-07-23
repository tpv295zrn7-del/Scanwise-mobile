const getReactNativeModule = () => {
  try {
    return require('react-native');
  } catch (_error) {
    return {
      Platform: { OS: 'unknown' },
      PermissionsAndroid: {
        PERMISSIONS: { CAMERA: 'android.permission.CAMERA' },
        RESULTS: { GRANTED: 'granted' }
      }
    };
  }
};

const getVisionCameraModule = () => {
  try {
    return require('react-native-vision-camera');
  } catch (_error) {
    return { Camera: {} };
  }
};

const getDeviceInfoModule = () => {
  try {
    const module = require('react-native-device-info');
    return module.default || module;
  } catch (_error) {
    return {};
  }
};

const normalizePermissionStatus = (status) =>
  status === 'authorized' || status === 'granted' ? 'granted' : 'denied';

const supportsCamera = async () => {
  const deviceInfo = getDeviceInfoModule();
  if (typeof deviceInfo.hasSystemFeature !== 'function') {
    return true;
  }
  try {
    const hasCamera = await deviceInfo.hasSystemFeature(
      'android.hardware.camera'
    );
    return hasCamera !== false;
  } catch (_error) {
    return true;
  }
};

export const checkCameraPermission = async () => {
  const { Platform, PermissionsAndroid } = getReactNativeModule();
  if (!(await supportsCamera())) {
    return 'denied';
  }

  if (
    Platform.OS === 'android' &&
    typeof PermissionsAndroid?.check === 'function' &&
    (await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA))
  ) {
    return 'granted';
  }

  const { Camera } = getVisionCameraModule();
  if (typeof Camera?.getCameraPermissionStatus === 'function') {
    return normalizePermissionStatus(await Camera.getCameraPermissionStatus());
  }

  return 'denied';
};

export const requestCameraPermission = async () => {
  const { Platform, PermissionsAndroid } = getReactNativeModule();

  if (
    Platform.OS === 'android' &&
    typeof PermissionsAndroid?.request === 'function'
  ) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );
    if (result === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }
  }

  const { Camera } = getVisionCameraModule();
  if (typeof Camera?.requestCameraPermission === 'function') {
    return (
      normalizePermissionStatus(await Camera.requestCameraPermission()) ===
      'granted'
    );
  }

  return false;
};
