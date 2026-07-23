import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import LoginScreen from '@/screens/auth/LoginScreen';
import SignupScreen from '@/screens/auth/SignupScreen';
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen';
import PasswordResetScreen from '@/screens/auth/PasswordResetScreen';
import OnboardingWelcomeScreen from '@/screens/onboarding/OnboardingWelcomeScreen';
import HealthGoalsScreen from '@/screens/onboarding/HealthGoalsScreen';
import AllergySetupScreen from '@/screens/onboarding/AllergySetupScreen';
import FamilyProfilesScreen from '@/screens/onboarding/FamilyProfilesScreen';
import ReviewProfileScreen from '@/screens/onboarding/ReviewProfileScreen';
import HomeScreen from '@/screens/home/HomeScreen';

const AuthStack = createStackNavigator();
const OnboardingStack = createStackNavigator();
const AppStack = createStackNavigator();
const Tabs = createBottomTabNavigator();

const MainTabs = () => (
  <Tabs.Navigator>
    <Tabs.Screen name="ScanTab" component={HomeScreen} />
    <Tabs.Screen name="SavedTab" component={HomeScreen} />
    <Tabs.Screen name="ProfileTab" component={HomeScreen} />
    <Tabs.Screen name="SettingsTab" component={HomeScreen} />
  </Tabs.Navigator>
);

const AuthNavigator = () => (
  <AuthStack.Navigator>
    <AuthStack.Screen name="LoginScreen" component={LoginScreen} />
    <AuthStack.Screen name="SignupScreen" component={SignupScreen} />
    <AuthStack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
    <AuthStack.Screen name="PasswordResetScreen" component={PasswordResetScreen} />
  </AuthStack.Navigator>
);

const OnboardingNavigator = () => (
  <OnboardingStack.Navigator>
    <OnboardingStack.Screen name="OnboardingWelcomeScreen" component={OnboardingWelcomeScreen} />
    <OnboardingStack.Screen name="HealthGoalsScreen" component={HealthGoalsScreen} />
    <OnboardingStack.Screen name="AllergySetupScreen" component={AllergySetupScreen} />
    <OnboardingStack.Screen name="FamilyProfilesScreen" component={FamilyProfilesScreen} />
    <OnboardingStack.Screen name="ReviewProfileScreen" component={ReviewProfileScreen} />
  </OnboardingStack.Navigator>
);

const AppNavigator = () => (
  <AppStack.Navigator>
    <AppStack.Screen name="HomeScreen" component={HomeScreen} />
    <AppStack.Screen name="MainTabs" component={MainTabs} />
  </AppStack.Navigator>
);

const linking = {
  prefixes: ['scanwise://'],
  config: {
    screens: {
      PasswordResetScreen: 'reset-password',
      HomeScreen: 'home',
    },
  },
};

const RootNavigator = ({ onStateChange = () => {} }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const onboardingComplete = useSelector((state) => state.onboarding.isComplete);

  return (
    <NavigationContainer linking={linking} onStateChange={onStateChange}>
      {!isAuthenticated ? <AuthNavigator /> : onboardingComplete ? <AppNavigator /> : <OnboardingNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
