import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HealthGoalsScreen from '@/screens/onboarding/HealthGoalsScreen';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({ useDispatch: () => mockDispatch }));

describe('HealthGoalsScreen', () => {
  it('renders 5 goals and enforces min, navigates on valid', () => {
    const navigation = { navigate: jest.fn() };
    const { getByText } = render(<HealthGoalsScreen navigation={navigation} />);
    ['Weight Management', 'Diabetes', 'Allergies', 'Heart Health', 'Wellness'].forEach((g) => expect(getByText(g)).toBeTruthy());
    fireEvent.press(getByText('Continue'));
    expect(getByText('Select at least one goal.')).toBeTruthy();

    fireEvent.press(getByText('Weight Management'));
    fireEvent.press(getByText('Continue'));
    expect(navigation.navigate).toHaveBeenCalledWith('AllergySetupScreen');
  });

  it('supports toggling selected goals', () => {
    const navigation = { navigate: jest.fn() };
    const { getByText } = render(<HealthGoalsScreen navigation={navigation} />);
    fireEvent.press(getByText('Weight Management'));
    fireEvent.press(getByText('Weight Management'));
    fireEvent.press(getByText('Continue'));
    expect(getByText('Select at least one goal.')).toBeTruthy();
  });
});
