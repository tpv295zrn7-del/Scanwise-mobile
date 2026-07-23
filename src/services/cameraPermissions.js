const normalizePermissionStatus = (status) => {
  if (status === 'authorized' || status === 'granted') return 'granted';
  if (status === 'denied' || status === 'blocked') return 'denied';
  return 'unknown';
};

export const requestCameraPermission = async (cameraApi) => {
  if (!cameraApi?.requestCameraPermission) return 'denied';
  const status = await cameraApi.requestCameraPermission();
  return normalizePermissionStatus(status);
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
