import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/redux/slices/authSlice';
import onboardingReducer from '@/redux/slices/onboardingSlice';
import healthProfilesReducer from '@/redux/slices/healthProfilesSlice';
import RootNavigator from '@/navigation/RootNavigator';

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    NavigationContainer: ({ children }) => React.createElement(React.Fragment, null, children),
  };
});

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => {
    const React = require('react');
    return {
      Navigator: ({ children }) => React.createElement(React.Fragment, null, children),
      Screen: ({ name }) => React.createElement('Text', null, name),
    };
  },
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => {
    const React = require('react');
    return {
      Navigator: ({ children }) => React.createElement(React.Fragment, null, children),
      Screen: ({ name }) => React.createElement('Text', null, name),
    };
  },
}));

const renderWith = (preloadedState) => {
  const store = configureStore({
    reducer: { auth: authReducer, onboarding: onboardingReducer, healthProfiles: healthProfilesReducer },
    preloadedState,
  });

  return render(
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
};

describe('Auth flow integration', () => {
  it('shows auth stack when unauthenticated', () => {
    const screen = renderWith(undefined);
    expect(screen.getByText('LoginScreen')).toBeTruthy();
  });

  it('shows onboarding stack when authenticated but incomplete', () => {
    const screen = renderWith({
      auth: { user: { id: '1' }, isAuthenticated: true, loading: false, error: null, accessToken: null, refreshToken: null, loginAttempts: 0, lockoutUntil: null, passwordResetRequested: false },
      onboarding: { currentStep: 0, completedSteps: [], goals: [], allergies: [], familyMembers: [], isComplete: false, loading: false, error: null },
      healthProfiles: { profile: null, familyMembers: [], loading: false, error: null, lastSyncTime: null },
    });
    expect(screen.getByText('OnboardingWelcomeScreen')).toBeTruthy();
  });

  it('shows app stack when onboarding complete', () => {
    const screen = renderWith({
      auth: { user: { id: '1' }, isAuthenticated: true, loading: false, error: null, accessToken: null, refreshToken: null, loginAttempts: 0, lockoutUntil: null, passwordResetRequested: false },
      onboarding: { currentStep: 0, completedSteps: [1,2,3,4,5], goals: [], allergies: [], familyMembers: [], isComplete: true, loading: false, error: null },
      healthProfiles: { profile: null, familyMembers: [], loading: false, error: null, lastSyncTime: null },
    });
    expect(screen.getByText('HomeScreen')).toBeTruthy();
  });
});
