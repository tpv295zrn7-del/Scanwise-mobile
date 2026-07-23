import {
  validateEmail as emailValidator,
  validatePassword as passwordValidator
} from '../utils/validation';

export const validatePassword = (password) => passwordValidator(password);

export const passwordStrength = (password = '') => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (score <= 1) return 'weak';
  if (score <= 3) return 'fair';
  return 'strong';
};

export const validateEmail = (email) => emailValidator(email);

export const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};
