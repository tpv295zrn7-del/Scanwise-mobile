import { validatePassword, passwordStrength, validateEmail, decodeToken } from '@/services/auth';

describe('auth service', () => {
  it('validates password and strength', () => {
    expect(validatePassword('weak').isValid).toBe(false);
    expect(validatePassword('Strong1!').isValid).toBe(true);
    expect(passwordStrength('a')).toBe('weak');
    expect(passwordStrength('Strong1!')).toBe('strong');
  });

  it('validates emails', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('invalid@')).toBe(false);
  });

  it('decodes token safely', () => {
    const token = `a.${Buffer.from(JSON.stringify({ exp: 1 })).toString('base64')}.c`;
    expect(decodeToken(token)).toEqual({ exp: 1 });
    expect(decodeToken('bad')).toBeNull();
  });
});
