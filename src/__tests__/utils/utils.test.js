import { mapErrorCode } from '@/utils/errorMapping';
import { validateLoginForm, validateSignupForm } from '@/utils/validation';
import { HEALTH_GOALS, MAX_FAMILY_MEMBERS, STORAGE_KEYS } from '@/utils/constants';

describe('utils', () => {
  it('maps errors', () => {
    expect(mapErrorCode('EMAIL_EXISTS')).toContain('exists');
    expect(mapErrorCode(undefined, 'fallback')).toBe('fallback');
  });

  it('validates forms', () => {
    const loginErrors = validateLoginForm({ email: 'bad', password: '' });
    expect(loginErrors.email).toBeTruthy();

    const signupErrors = validateSignupForm({ email: 'a@b.com', password: 'weak', confirmPassword: 'x', acceptedTerms: false });
    expect(signupErrors.password).toBeTruthy();
    expect(signupErrors.confirmPassword).toBeTruthy();
    expect(signupErrors.acceptedTerms).toBeTruthy();
  });

  it('exports constants', () => {
    expect(HEALTH_GOALS).toHaveLength(5);
    expect(MAX_FAMILY_MEMBERS).toBe(5);
    expect(STORAGE_KEYS.ACCESS_TOKEN).toBe('accessToken');
  });
});
