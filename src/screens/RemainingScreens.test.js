import { ForgotPasswordScreen } from './ForgotPasswordScreen';
import { PasswordResetScreen } from './PasswordResetScreen';
import { AllergySetupScreen } from './AllergySetupScreen';
import { FamilyProfilesScreen } from './FamilyProfilesScreen';
import { ReviewProfileScreen } from './ReviewProfileScreen';
import { ScanScreen } from './ScanScreen';
import { CorrectionSubmissionScreen } from './CorrectionSubmissionScreen';

jest.mock('../redux/slices/authSlice', () => ({
  requestPasswordReset: jest.fn((email) => ({
    type: 'forgot',
    payload: email
  })),
  confirmPasswordReset: jest.fn((payload) => ({ type: 'reset', payload }))
}));

test('forgot/reset/allergy/family/review/scan/correction coverage', () => {
  const dispatch = jest.fn();
  const nav = { navigate: jest.fn() };

  const forgot = ForgotPasswordScreen({ dispatch });
  expect(forgot.submit('bad')).toBe('Validation failed');
  expect(forgot.submit('a@b.com')).toBe('sent');

  const reset = PasswordResetScreen({
    dispatch,
    navigation: nav,
    token: 'tok'
  });
  expect(reset.submit('weak')).toBe('Validation failed');
  expect(reset.submit('Aa!23456')).toBe('reset');

  const allergy = AllergySetupScreen({ dispatch });
  allergy.setSeverity('nuts', 'high');

  const family = FamilyProfilesScreen({ dispatch });
  family.add({ id: '1', name: 'Sam' });

  const review = ReviewProfileScreen({ dispatch, profile: { goals: [] } });
  review.complete();

  expect(ScanScreen().mode).toBe('scan');
  expect(CorrectionSubmissionScreen().submit).toBe(true);
});
