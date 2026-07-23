import {
  AuthStack,
  OnboardingStack,
  AppTabs,
  resolveRouteGroup,
  linking
} from './RootNavigator';

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
