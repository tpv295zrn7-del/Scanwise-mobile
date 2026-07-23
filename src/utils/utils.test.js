import { validateEmail, validatePassword, validatePhone } from './validation';
import { mapBackendError } from './errorMapping';
import { COLORS, ENDPOINTS, RETRY_COUNT } from './constants';

test('validation, error map, constants', () => {
  expect(validateEmail('a@b.com')).toBe(true);
  expect(validatePassword('Aa!23456')).toBe(true);
  expect(validatePhone('+14155552671')).toBe(true);
  expect(mapBackendError('INVALID_CREDENTIALS')).toContain('Invalid');
  expect(mapBackendError('UNKNOWN')).toContain('Unexpected');
  expect(COLORS.primary).toBe('#10B981');
  expect(ENDPOINTS.login).toBe('/auth/login');
  expect(RETRY_COUNT).toBe(3);
});
