import React, { useState } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
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
  const auth = useSelector((s) => s.auth);
  const onboarding = useSelector((s) => s.onboarding);
  const healthProfiles = useSelector((s) => s.healthProfiles);
  const scans = useSelector((s) => s.scans);
  const dispatch = useDispatch();

  const fullState = store.getState();
  const routeGroup = resolveRouteGroup(fullState);
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
  const user = selectCurrentUser(fullState);
  const progress = selectOnboardingProgress(fullState);

  const descriptor = factory({
    dispatch,
    navigation,
    state: fullState,
    user,
    recentScans: scans?.items || [],
    familyMembers: healthProfiles?.familyMembers || [],
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
