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

test('camera permissions are requested on startup when missing', async () => {
  await expect(ensureCameraPermission()).resolves.toBe('granted');
});
