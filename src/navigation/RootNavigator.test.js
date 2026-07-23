import {
  AuthStack,
  OnboardingStack,
  AppTabs,
  ensureCameraPermission,
  resolveRouteGroup,
  linking
} from './RootNavigator';

jest.mock('../services/cameraPermissions', () => ({
  checkCameraPermission: jest.fn(() => Promise.resolve('denied')),
  requestCameraPermission: jest.fn(() => Promise.resolve(true))
}));

test('route guards and linking', () => {
  expect(AuthStack).toContain('Login');
  expect(OnboardingStack).toContain('HealthGoals');
  expect(AppTabs).toContain('Saved');
  expect(
    resolveRouteGroup({ auth: { user: null }, onboarding: { progress: 0 } })
  ).toBe('AuthStack');
  expect(
    resolveRouteGroup({
      auth: { user: { id: '1' } },
      onboarding: { progress: 0.2 }
    })
  ).toBe('OnboardingStack');
  expect(
    resolveRouteGroup({
      auth: { user: { id: '1' } },
      onboarding: { progress: 1 }
    })
  ).toBe('AppStack');
  expect(linking.config.screens.PasswordReset).toBe('reset-password');
});


test('camera permissions return immediately when already granted', async () => {
  const permissions = require('../services/cameraPermissions');
  permissions.checkCameraPermission.mockResolvedValueOnce('granted');

  await expect(ensureCameraPermission()).resolves.toBe('granted');
  expect(permissions.requestCameraPermission).not.toHaveBeenCalled();
});

test('camera permissions are requested on startup when missing', async () => {
  await expect(ensureCameraPermission()).resolves.toBe('granted');
});

test('camera permissions stay denied when request is rejected', async () => {
  const permissions = require('../services/cameraPermissions');
  permissions.requestCameraPermission.mockResolvedValueOnce(false);
  await expect(ensureCameraPermission()).resolves.toBe('denied');
});

test('camera permissions preserve unknown request status', async () => {
  const permissions = require('../services/cameraPermissions');
  permissions.requestCameraPermission.mockResolvedValueOnce('unknown');
  await expect(ensureCameraPermission()).resolves.toBe('unknown');
});
