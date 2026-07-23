import { selectCurrentUser } from '../redux/slices/authSlice';
import { selectOnboardingProgress } from '../redux/slices/onboardingSlice';
import {
  checkCameraPermission,
  requestCameraPermission
} from '../services/cameraPermissions';

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

export const ensureCameraPermission = async () => {
  const permission = await checkCameraPermission();
  if (permission === 'granted') {
    return 'granted';
  }

  const requestedPermission = await requestCameraPermission();
  if (requestedPermission === true || requestedPermission === 'granted') {
    return 'granted';
  }
  if (requestedPermission === 'unknown') {
    return 'unknown';
  }

  return 'denied';
};

export const RootNavigator = (state) => resolveRouteGroup(state);
