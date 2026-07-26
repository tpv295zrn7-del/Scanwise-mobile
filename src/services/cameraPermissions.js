import { getCameraPermissionsAsync, requestCameraPermissionsAsync } from 'expo-camera';

export const checkCameraPermission = async () => {
  const { status } = await getCameraPermissionsAsync();
  return status;
};

export const requestCameraPermission = async () => {
  const { status } = await requestCameraPermissionsAsync();
  return status;
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
