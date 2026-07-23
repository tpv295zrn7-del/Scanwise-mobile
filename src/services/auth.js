const EMAIL_REGEX =
  /^(?:[a-zA-Z0-9_'^&/+{}=?`~!#$%*?-]+(?:\.[a-zA-Z0-9_'^&/+{}=?`~!#$%*?-]+)*)@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

export const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) errors.push('Password must be at least 8 characters.');
  if (!/[A-Z]/.test(password)) errors.push('Password must include an uppercase letter.');
  if (!/[0-9]/.test(password)) errors.push('Password must include a number.');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must include a special character.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const passwordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

  if (score <= 1) return 'weak';
  if (score <= 3) return 'fair';
  return 'strong';
};

export const validateEmail = (email) => EMAIL_REGEX.test(String(email).trim());

export const decodeToken = (token) => {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const normalize = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(global.atob(normalize));
    return payload;
  } catch (_error) {
    return null;
  }
};
