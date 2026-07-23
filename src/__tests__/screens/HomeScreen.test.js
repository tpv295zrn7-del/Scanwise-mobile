import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '@/screens/home/HomeScreen';

jest.mock('react-redux', () => ({
  useSelector: (selector) =>
    selector({
      auth: { user: { name: 'Alex' } },
      onboarding: { goals: ['A'] },
      healthProfiles: { profile: { allergies: ['nuts'] }, familyMembers: [{ name: 'Kid' }] },
    }),
}));

describe('HomeScreen', () => {
  it('renders summary and navigates to tabs', () => {
    const navigation = { navigate: jest.fn() };
    const { getByText } = render(<HomeScreen navigation={navigation} />);
    expect(getByText('Welcome, Alex!')).toBeTruthy();
    fireEvent.press(getByText('Scan Product'));
    fireEvent.press(getByText('Settings'));
    expect(navigation.navigate).toHaveBeenCalledWith('ScanTab');
    expect(navigation.navigate).toHaveBeenCalledWith('SettingsTab');
  });
});
