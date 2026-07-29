import React, { useState } from 'react';
import { Provider, useSelector, useDispatch, useStore } from 'react-redux';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createStore } from './redux/store';
import { resolveRouteGroup, AuthStack, OnboardingStack, AppTabs } from './navigation/RootNavigator';
import { ScreenRenderer } from './renderer/ScreenRenderer';
import { selectCurrentUser } from './redux/slices/authSlice';
import { selectOnboardingProgress } from './redux/slices/onboardingSlice';

// Screen factories
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

const INITIAL_SCREENS = {
  AuthStack: 'Login',
  OnboardingStack: 'OnboardingWelcome',
  AppStack: 'Home',
};

const AppNavigator = () => {
  const auth = useSelector((s) => s.auth);
  const onboarding = useSelector((s) => s.onboarding);
  const healthProfiles = useSelector((s) => s.healthProfiles);
  const scans = useSelector((s) => s.scans);
  const dispatch = useDispatch();

  const store = useStore();
  const fullState = store.getState();
  const routeGroup = resolveRouteGroup(fullState);
  const [currentScreen, setCurrentScreen] = useState(
    INITIAL_SCREENS[routeGroup] || 'Home'
  );
  const [routeParams, setRouteParams] = useState({});

  const navigation = {
    navigate: (name, params) => {
      if (params) {
        setRouteParams(prev => ({ ...prev, [name]: params }));
      }
      setCurrentScreen(name);
    },
    goBack: () => {
      setCurrentScreen('Home');
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

  const showBottomTabs = ['Home', 'Scan', 'ProductResult', 'Saved', 'Comparison', 'CorrectionSubmission'].includes(currentScreen);

  const goBackFromCurrent = () => {
    if (
      currentScreen === 'ProductResult' ||
      currentScreen === 'Comparison' ||
      currentScreen === 'CorrectionSubmission' ||
      currentScreen === 'Saved'
    ) {
      setCurrentScreen('Scan');
    } else {
      setCurrentScreen('Home');
    }
  };

  return (
    <View style={{flex: 1}}>
      {currentScreen !== 'Home' && (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={goBackFromCurrent}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{currentScreen}</Text>
        </View>
      )}
      <ScreenRenderer key={currentScreen} descriptor={descriptor} screenName={currentScreen} />
      {showBottomTabs && (
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setCurrentScreen('Scan')}
            accessibilityRole="button"
            accessibilityLabel="Scan tab"
          >
            <Text style={[styles.tabText, currentScreen === 'Scan' && styles.tabTextActive]}>
              Scan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setCurrentScreen('Saved')}
            accessibilityRole="button"
            accessibilityLabel="Saved tab"
          >
            <Text style={[styles.tabText, currentScreen === 'Saved' && styles.tabTextActive]}>
              Saved
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    zIndex: 100,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#111827',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 24,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#10B981',
    fontWeight: '600',
  },
});

export default function App() {
  return (
    <Provider store={createStore()}>
      <AppNavigator />
    </Provider>
  );
}
