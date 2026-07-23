import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen';
import PasswordResetScreen from '@/screens/auth/PasswordResetScreen';
import AllergySetupScreen from '@/screens/onboarding/AllergySetupScreen';
import FamilyProfilesScreen from '@/screens/onboarding/FamilyProfilesScreen';
import ReviewProfileScreen from '@/screens/onboarding/ReviewProfileScreen';
import * as api from '@/services/api';

const mockDispatch = jest.fn();
const mockSelectorState = {
  auth: { loading: false, error: null },
  healthProfiles: { familyMembers: [], profile: { allergies: [] } },
  onboarding: { goals: ['WEIGHT_MANAGEMENT'] },
};

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector) => selector(mockSelectorState),
}));

jest.mock('@/redux/slices/authSlice', () => {
  const original = jest.requireActual('@/redux/slices/authSlice');
  return {
    ...original,
    requestPasswordReset: Object.assign(jest.fn(() => ({ type: 'auth/requestPasswordReset/fulfilled' })), {
      fulfilled: { match: () => true },
    }),
    confirmPasswordReset: Object.assign(jest.fn(() => ({ type: 'auth/confirmPasswordReset/fulfilled' })), {
      fulfilled: { match: () => true },
    }),
  };
});

jest.mock('@/services/api');

describe('Additional screens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockResolvedValue({ type: 'ok' });
    api.onboardingApi.save.mockResolvedValue({});
    api.onboardingApi.complete.mockResolvedValue({});
  });

  it('ForgotPassword validates email and shows success', async () => {
    const { getByText, getAllByLabelText, findByText } = render(<ForgotPasswordScreen />);
    fireEvent.press(getByText('Send Reset Link'));
    expect(await findByText('Please enter a valid email.')).toBeTruthy();

    fireEvent.changeText(getAllByLabelText('Email')[1], 'user@example.com');
    fireEvent.press(getByText('Send Reset Link'));
    await waitFor(() => expect(mockDispatch).toHaveBeenCalled());
  });

  it('PasswordReset validates matching passwords and navigates', async () => {
    const navigation = { navigate: jest.fn() };
    const { getByText, getAllByLabelText, findByText } = render(
      <PasswordResetScreen navigation={navigation} route={{ params: { token: 'abc' } }} />
    );

    fireEvent.changeText(getAllByLabelText('New Password')[1], 'Strong1!');
    fireEvent.changeText(getAllByLabelText('Confirm Password')[1], 'Mismatch1!');
    fireEvent.press(getByText('Reset Password'));
    expect(await findByText('Passwords must match.')).toBeTruthy();

    fireEvent.changeText(getAllByLabelText('Confirm Password')[1], 'Strong1!');
    fireEvent.press(getByText('Reset Password'));
    await waitFor(() => expect(mockDispatch).toHaveBeenCalled());
  });

  it('AllergySetup toggles and continues', () => {
    const navigation = { navigate: jest.fn() };
    const { getByText } = render(<AllergySetupScreen navigation={navigation} />);

    fireEvent.press(getByText('Add dairy'));
    fireEvent.press(getByText('mild'));
    fireEvent.press(getByText('Remove'));
    fireEvent.press(getByText('Add dairy'));
    fireEvent.press(getByText('Skip'));
    fireEvent.press(getByText('Continue'));
    expect(navigation.navigate).toHaveBeenCalledWith('FamilyProfilesScreen');
  });

  it('FamilyProfiles adds/deletes and continues', () => {
    mockSelectorState.healthProfiles.familyMembers = [
      { id: '1', name: 'Pat', relationship: 'parent', allergies: [], dietaryPreferences: [] },
    ];
    const navigation = { navigate: jest.fn() };
    const { getByText, getAllByLabelText } = render(<FamilyProfilesScreen navigation={navigation} />);
    fireEvent.changeText(getAllByLabelText('Member Name')[1], 'Pat');
    fireEvent.changeText(getAllByLabelText('Relationship')[1], 'parent');
    fireEvent.press(getByText('Add Member'));
    fireEvent.press(getByText('Delete'));
    fireEvent.press(getByText('Continue'));
    expect(navigation.navigate).toHaveBeenCalledWith('ReviewProfileScreen');
    mockSelectorState.healthProfiles.familyMembers = [];
  });

  it('ReviewProfile retries and success path', async () => {
    const navigation = { navigate: jest.fn() };
    api.onboardingApi.save.mockRejectedValueOnce(new Error('nope')).mockResolvedValueOnce({});

    const { getByText, getAllByText, findByText } = render(<ReviewProfileScreen navigation={navigation} />);
    getAllByText('Edit').forEach((button) => fireEvent.press(button));
    fireEvent.press(getByText('Complete Setup'));
    expect(await findByText('Could not complete setup. Retry.')).toBeTruthy();

    fireEvent.press(getByText('Complete Setup'));
    await waitFor(() => expect(navigation.navigate).toHaveBeenCalledWith('HomeScreen'));
  });
});
