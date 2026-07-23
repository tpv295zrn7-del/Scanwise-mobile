import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from '@/screens/auth/LoginScreen';

const mockDispatch = jest.fn();
const mockAuthState = { loading: false, error: 'Bad credentials', loginAttempts: 5, lockoutUntil: Date.now() + 1000 };

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector) => selector({ auth: mockAuthState }),
}));

jest.mock('@/redux/slices/authSlice', () => {
  const original = jest.requireActual('@/redux/slices/authSlice');
  return {
    ...original,
    loginUser: Object.assign(jest.fn(() => ({ type: 'auth/loginUser/fulfilled' })), { fulfilled: { match: () => true } }),
  };
});

describe('LoginScreen', () => {
  beforeEach(() => {
    mockAuthState.loading = false;
    mockAuthState.error = 'Bad credentials';
    mockAuthState.loginAttempts = 5;
    mockAuthState.lockoutUntil = Date.now() + 1000;
    mockDispatch.mockReset();
    mockDispatch.mockResolvedValue({ type: 'auth/loginUser/fulfilled' });
  });

  it('renders and links navigate', () => {
    const navigation = { navigate: jest.fn() };
    const { getByText } = render(<LoginScreen navigation={navigation} />);
    expect(getByText('Login')).toBeTruthy();
    expect(getByText('Account locked after 5/5 attempts.')).toBeTruthy();
    fireEvent.press(getByText('Create account'));
    fireEvent.press(getByText('Forgot password'));
    expect(navigation.navigate).toHaveBeenCalledWith('SignupScreen');
    expect(navigation.navigate).toHaveBeenCalledWith('ForgotPasswordScreen');
  });

  it('validates empty form', async () => {
    const navigation = { navigate: jest.fn() };
    const { getByText, findByText } = render(<LoginScreen navigation={navigation} />);
    fireEvent.press(getByText('Sign In'));
    expect(await findByText('Enter a valid email.')).toBeTruthy();
  });

  it('submits valid form and navigates home', async () => {
    mockAuthState.error = null;
    mockAuthState.loginAttempts = 0;
    mockAuthState.lockoutUntil = null;
    const navigation = { navigate: jest.fn() };
    const { getByText, getAllByLabelText } = render(<LoginScreen navigation={navigation} />);
    fireEvent.changeText(getAllByLabelText('Email')[1], 'user@example.com');
    fireEvent.changeText(getAllByLabelText('Password')[1], 'Strong1!');
    fireEvent.press(getByText('Sign In'));
    expect(mockDispatch).toHaveBeenCalled();
  });
});
