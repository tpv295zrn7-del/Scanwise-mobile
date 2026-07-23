import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OnboardingWelcomeScreen from '@/screens/onboarding/OnboardingWelcomeScreen';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({ useDispatch: () => mockDispatch }));

describe('OnboardingWelcomeScreen', () => {
  it('renders and navigates continue/skip', () => {
    const navigation = { navigate: jest.fn() };
    const { getByText } = render(<OnboardingWelcomeScreen navigation={navigation} />);
    fireEvent.press(getByText('Continue'));
    fireEvent.press(getByText('Skip for Now'));
    expect(navigation.navigate).toHaveBeenCalledWith('HealthGoalsScreen');
    expect(navigation.navigate).toHaveBeenCalledWith('HomeScreen');
    expect(mockDispatch).toHaveBeenCalled();
  });
});
