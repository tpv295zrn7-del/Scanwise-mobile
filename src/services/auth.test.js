import {
  validatePassword,
  passwordStrength,
  validateEmail,
  decodeToken
} from './auth';

global.atob = (v) => Buffer.from(v, 'base64').toString('utf8');

test('auth helpers', () => {
  expect(validatePassword('Aa!23456')).toBe(true);
  expect(passwordStrength('Aa!23456')).toBe('strong');
  expect(passwordStrength('Aa123456')).toBe('fair');
  expect(passwordStrength('abc')).toBe('weak');
  expect(validateEmail('a@b.com')).toBe(true);
  expect(validateEmail('invalid')).toBe(false);
  const token = `x.${Buffer.from(JSON.stringify({ exp: 9999999999 })).toString('base64')}.y`;
  expect(decodeToken(token).exp).toBe(9999999999);
  expect(decodeToken('bad.token')).toBeNull();
  expect(decodeToken('bad')).toBeNull();
});
