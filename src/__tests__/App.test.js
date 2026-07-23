import React from 'react';
import { render } from '@testing-library/react-native';
import App from '@/App';

jest.mock('@/navigation/RootNavigator', () => {
  const React = require('react');
  return function MockRootNavigator() {
    return React.createElement('Text', null, 'Root');
  };
});

describe('App', () => {
  it('renders provider and root navigator', () => {
    const screen = render(<App />);
    expect(screen.getByText('Root')).toBeTruthy();
  });
});
