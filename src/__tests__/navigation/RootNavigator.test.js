import React from 'react';
import { render } from '@testing-library/react-native';
import RootNavigator from '@/navigation/RootNavigator';

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    NavigationContainer: ({ children, onStateChange }) => {
      if (onStateChange) {
        onStateChange();
      }
      return React.createElement(React.Fragment, null, children);
    },
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

jest.mock('react-redux', () => ({
  useSelector: (selector) =>
    selector({
      auth: { isAuthenticated: true },
      onboarding: { isComplete: true },
    }),
}));

describe('RootNavigator', () => {
  it('renders app stack when authenticated and complete', () => {
    const onStateChange = jest.fn();
    const screen = render(<RootNavigator onStateChange={onStateChange} />);
    expect(screen.getByText('HomeScreen')).toBeTruthy();
    expect(onStateChange).toHaveBeenCalled();
  });
});
