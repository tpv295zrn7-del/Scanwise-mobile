import {
  AuthStack,
  OnboardingStack,
  AppTabs,
  createStackScreenOptions,
  ensureCameraPermission,
  resolveRouteGroup,
  linking
} from './RootNavigator';

jest.mock('../services/cameraPermissions', () => ({
  checkCameraPermission: jest.fn(() => Promise.resolve('denied')),
  requestCameraPermission: jest.fn(() => Promise.resolve(true))
}));

const mockNavigation = { canGoBack: jest.fn(() => false), goBack: jest.fn() };
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => mockNavigation)
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

test('stack screen options show an explicit back button only when navigation can go back', () => {
  const { useNavigation } = require('@react-navigation/native');

  // When can't go back — BackButton renders null
  useNavigation.mockReturnValue({ canGoBack: () => false, goBack: jest.fn() });
  const blockedOptions = createStackScreenOptions();
  const blockedElement = blockedOptions.headerLeft();
  expect(blockedElement.type()).toBeNull();

  // When can go back — BackButton renders the pressable
  const goBack = jest.fn();
  useNavigation.mockReturnValue({ canGoBack: () => true, goBack });
  const options = createStackScreenOptions();
  const element = options.headerLeft();
  const rendered = element.type();
  expect(typeof rendered.type).toBe('function');
  rendered.props.onPress();
  expect(goBack).toHaveBeenCalled();
});
