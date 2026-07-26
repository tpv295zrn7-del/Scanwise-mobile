import React, { useState } from 'react';
import { Provider, useSelector, useDispatch, shallowEqual } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';
import { store } from './redux/store';
import { resolveRouteGroup, AuthStack, OnboardingStack, AppTabs } from './navigation/RootNavigator';
import { ScreenRenderer } from './renderer/ScreenRenderer';
import { selectCurrentUser } from './redux/slices/authSlice';
import { selectOnboardingProgress } from './redux/slices/onboardingSlice';

// Screen factories — each returns a plain descriptor object
import { HomeScreen } from './screens/HomeScreen';
import { LoginScreen } from './screens/LoginScreen';
import { SignupScreen } from './screens/SignupScreen';
import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
import { PasswordResetScreen } from './screens/PasswordResetScreen';
import { OnboardingWelcomeScreen } from './screens/OnboardingWelcomeScreen';
import { HealthGoalsScreen } from './screens/HealthGoalsScreen';
import { AllergySetupScreen } from './screens/AllergySetupScreen';
import { FamilyProfilesScreen } from './screens/FamilyProfilesScreen';
import { ReviewProfileScreen } from './screens/ReviewProfileScreen';
import { ScanScreen } from './screens/ScanScreen';
import { ProductResultScreen } from './screens/ProductResultScreen';
import { SavedItemsScreen } from './screens/SavedItemsScreen';
import { ComparisonScreen } from './screens/ComparisonScreen';
import { CorrectionSubmissionScreen } from './screens/CorrectionSubmissionScreen';

// Map screen names to factories
const SCREEN_FACTORIES = {
  Home: HomeScreen,
  Login: LoginScreen,
  Signup: SignupScreen,
  ForgotPassword: ForgotPasswordScreen,
  PasswordReset: PasswordResetScreen,
  OnboardingWelcome: OnboardingWelcomeScreen,
  HealthGoals: HealthGoalsScreen,
  AllergySetup: AllergySetupScreen,
  FamilyProfiles: FamilyProfilesScreen,
  ReviewProfile: ReviewProfileScreen,
  Scan: ScanScreen,
  ProductResult: ProductResultScreen,
  Saved: SavedItemsScreen,
  Comparison: ComparisonScreen,
  CorrectionSubmission: CorrectionSubmissionScreen,
};

// Initial screen per route group
const INITIAL_SCREENS = {
  AuthStack: 'Login',
  OnboardingStack: 'OnboardingWelcome',
  AppStack: 'Home',
};

/**
 * Simple in-app navigation: tracks the current screen name,
 * provides a navigate/goBack API compatible with the factory
 * function signatures.
 */
const AppNavigator = () => {
  // Select only the state slices needed for route resolution
  // shallowEqual prevents infinite re-renders from new object literals
  const state = useSelector((s) => ({
    auth: s.auth,
    onboarding: s.onboarding,
    healthProfiles: s.healthProfiles,
    scans: s.scans,
  }), shallowEqual);
  const dispatch = useDispatch();

  const routeGroup = resolveRouteGroup(state);
  const [screenStack, setScreenStack] = useState([
    INITIAL_SCREENS[routeGroup] || 'Home',
  ]);
  const [routeParams, setRouteParams] = useState({});

  const currentScreen = screenStack[screenStack.length - 1];

  const navigation = {
    navigate: (name, params) => {
      setScreenStack((prev) => [...prev, name]);
      if (params) {
        setRouteParams((prev) => ({ ...prev, [name]: params }));
      }
    },
    goBack: () => {
      setScreenStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
    },
  };

  const factory = SCREEN_FACTORIES[currentScreen];

  if (!factory) {
    return (
      <View style={styles.centered}>
        <Text style={styles.fallbackText}>
          Screen not found: {currentScreen}
        </Text>
      </View>
    );
  }

  // Build dependencies for the factory.
  // Each factory destructures only what it needs from this object.
  const user = selectCurrentUser(state);
  const progress = selectOnboardingProgress(state);

  const descriptor = factory({
    dispatch,
    navigation,
    state,
    user,
    recentScans: state?.scans?.items || [],
    familyMembers: state?.healthProfiles?.familyMembers || [],
    progress,
    ...(routeParams[currentScreen] || {}),
  });

  return <ScreenRenderer descriptor={descriptor} screenName={currentScreen} />;
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  fallbackText: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default function App() {
  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}
