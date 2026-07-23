import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SignupScreen from '@/screens/auth/SignupScreen';

const mockDispatch = jest.fn().mockResolvedValue({ type: 'auth/signupUser/fulfilled' });
jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector) => selector({ auth: { loading: false, error: 'Email exists' } }),
}));

jest.mock('@/redux/slices/authSlice', () => {
  const original = jest.requireActual('@/redux/slices/authSlice');
  return {
    ...original,
    signupUser: Object.assign(jest.fn(() => ({ type: 'auth/signupUser/fulfilled' })), { fulfilled: { match: () => true } }),
  };
});

describe('SignupScreen', () => {
  it('renders all fields and shows strength', () => {
    const navigation = { navigate: jest.fn() };
    const { getByText, getAllByLabelText } = render(<SignupScreen navigation={navigation} />);
    expect(getByText('Sign up')).toBeTruthy();
    fireEvent.changeText(getAllByLabelText('Password')[1], 'Strong1!');
    expect(getByText('Password strength: strong')).toBeTruthy();
  });

  it('requires terms and matching password, then navigates', async () => {
    const navigation = { navigate: jest.fn() };
    const { getByText, getAllByLabelText, findByText } = render(<SignupScreen navigation={navigation} />);
    fireEvent.changeText(getAllByLabelText('Email')[1], 'a@b.com');
    fireEvent.changeText(getAllByLabelText('Password')[1], 'Strong1!');
    fireEvent.changeText(getAllByLabelText('Confirm Password')[1], 'Strong1?');
    fireEvent.press(getByText('Create Account'));
    expect(await findByText('Passwords must match.')).toBeTruthy();

    fireEvent.changeText(getAllByLabelText('Confirm Password')[1], 'Strong1!');
    fireEvent.press(getByText('☐ Accept Terms'));
    fireEvent.press(getByText('Create Account'));
    await findByText('☑ Accept Terms');
    fireEvent.press(getByText('Create Account'));
    expect(navigation.navigate).toHaveBeenCalledWith('OnboardingWelcomeScreen');
  });
});
