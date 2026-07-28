import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import {
  linking,
  resolveRouteGroup
} from './src/navigation/RootNavigator';
import { LoginScreenView } from './src/screens/LoginScreen';
import { SignupScreenView } from './src/screens/SignupScreen';
import { ForgotPasswordScreenView } from './src/screens/ForgotPasswordScreen';
import { PasswordResetScreenView } from './src/screens/PasswordResetScreen';
import { OnboardingWelcomeScreenView } from './src/screens/OnboardingWelcomeScreen';
import { HealthGoalsScreenView } from './src/screens/HealthGoalsScreen';
import { AllergySetupScreenView } from './src/screens/AllergySetupScreen';
import { FamilyProfilesScreenView } from './src/screens/FamilyProfilesScreen';
import { ReviewProfileScreenView } from './src/screens/ReviewProfileScreen';
import { ScanScreenView } from './src/screens/ScanScreen';
import { SavedItemsScreenView } from './src/screens/SavedItemsScreen';
import { HomeScreenView } from './src/screens/HomeScreen';
import { ProductResultScreenView } from './src/screens/ProductResultScreen';
import { ComparisonScreenView } from './src/screens/ComparisonScreen';
import { CorrectionSubmissionScreenView } from './src/screens/CorrectionSubmissionScreen';

const AuthStack = createNativeStackNavigator();
const OnboardingStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthNavigator = () =>
  React.createElement(
    AuthStack.Navigator,
    null,
    React.createElement(AuthStack.Screen, {
      name: 'Login',
      component: LoginScreenView
    }),
    React.createElement(AuthStack.Screen, {
      name: 'Signup',
      component: SignupScreenView
    }),
    React.createElement(AuthStack.Screen, {
      name: 'ForgotPassword',
      component: ForgotPasswordScreenView
    }),
    React.createElement(AuthStack.Screen, {
      name: 'PasswordReset',
      component: PasswordResetScreenView
    })
  );

const OnboardingNavigator = () =>
  React.createElement(
    OnboardingStack.Navigator,
    null,
    React.createElement(OnboardingStack.Screen, {
      name: 'OnboardingWelcome',
      component: OnboardingWelcomeScreenView
    }),
    React.createElement(OnboardingStack.Screen, {
      name: 'HealthGoals',
      component: HealthGoalsScreenView
    }),
    React.createElement(OnboardingStack.Screen, {
      name: 'AllergySetup',
      component: AllergySetupScreenView
    }),
    React.createElement(OnboardingStack.Screen, {
      name: 'FamilyProfiles',
      component: FamilyProfilesScreenView
    }),
    React.createElement(OnboardingStack.Screen, {
      name: 'ReviewProfile',
      component: ReviewProfileScreenView
    })
  );

const AppTabsNavigator = () =>
  React.createElement(
    Tab.Navigator,
    null,
    React.createElement(Tab.Screen, { name: 'Scan', component: ScanScreenView }),
    React.createElement(Tab.Screen, {
      name: 'Saved',
      component: SavedItemsScreenView
    }),
    React.createElement(Tab.Screen, {
      name: 'Profile',
      component: HomeScreenView
    })
  );

const MainAppNavigator = () =>
  React.createElement(
    AppStack.Navigator,
    null,
    React.createElement(AppStack.Screen, {
      name: 'Home',
      component: AppTabsNavigator,
      options: { headerShown: false }
    }),
    React.createElement(AppStack.Screen, {
      name: 'ProductResult',
      component: ProductResultScreenView
    }),
    React.createElement(AppStack.Screen, {
      name: 'ProductResultScreen',
      component: ProductResultScreenView
    }),
    React.createElement(AppStack.Screen, {
      name: 'Comparison',
      component: ComparisonScreenView
    }),
    React.createElement(AppStack.Screen, {
      name: 'CorrectionSubmission',
      component: CorrectionSubmissionScreenView
    })
  );

const RootFlow = () => {
  const routeGroup = useSelector((state) => resolveRouteGroup(state));

  if (routeGroup === 'AuthStack') {
    return React.createElement(AuthNavigator);
  }
  if (routeGroup === 'OnboardingStack') {
    return React.createElement(OnboardingNavigator);
  }
  return React.createElement(MainAppNavigator);
};

const AppRoot = () =>
  React.createElement(
    Provider,
    { store },
    React.createElement(
      NavigationContainer,
      { linking },
      React.createElement(RootFlow)
    )
  );

// Default export for Expo 49 AppEntry.js (`import App from '../../App'`).
// Named export satisfies any bundler variant that uses `import { App } from '../../App'`.
export { AppRoot as App };
export default AppRoot;
