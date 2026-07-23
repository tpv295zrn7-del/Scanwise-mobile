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

const normalizePermissionStatus = (status) => {
  if (status === 'authorized' || status === 'granted') {
    return 'granted';
  }
  if (status === 'denied' || status === 'blocked') {
    return 'denied';
  }
  return 'unknown';
};

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
    const status = normalizePermissionStatus(
      await Camera.getCameraPermissionStatus()
    );
    return status === 'unknown' ? 'denied' : status;
  }

  return 'denied';
};

export const requestCameraPermission = async (cameraApi) => {
  if (cameraApi) {
    if (!cameraApi.requestCameraPermission) {
      return 'denied';
    }

    const status = await cameraApi.requestCameraPermission();
    return normalizePermissionStatus(status);
  }

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
    return normalizePermissionStatus(await Camera.requestCameraPermission()) === 'granted';
  }

  return false;
};

export const getCameraPermissionModel = ({
  status,
  cameraAvailable = true,
  canOpenSettings = true
}) => ({
  status,
  cameraAvailable,
  showManualEntry: status !== 'granted' || !cameraAvailable,
  showSettingsLink: status === 'denied' && canOpenSettings
});
