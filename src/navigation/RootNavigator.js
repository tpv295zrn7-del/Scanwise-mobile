import { selectCurrentUser } from '../redux/slices/authSlice';
import { selectOnboardingProgress } from '../redux/slices/onboardingSlice';

export const linking = {
  prefixes: ['scanwise://'],
  config: {
    screens: {
      PasswordReset: 'reset-password',
      Home: 'home'
    }
  }
};

export const AuthStack = ['Login', 'Signup', 'ForgotPassword', 'PasswordReset'];
export const OnboardingStack = [
  'OnboardingWelcome',
  'HealthGoals',
  'AllergySetup',
  'FamilyProfiles',
  'ReviewProfile'
];
export const AppTabs = ['Scan', 'Saved', 'Profile'];

export const resolveRouteGroup = (state) => {
  const user = selectCurrentUser(state);
  const progress = selectOnboardingProgress(state);
  if (!user) return 'AuthStack';
  if (progress < 1) return 'OnboardingStack';
  return 'AppStack';
};

export const RootNavigator = (state) => resolveRouteGroup(state);
