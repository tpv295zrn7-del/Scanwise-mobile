const ERROR_MAP = {
  INVALID_CREDENTIALS: 'Email or password is incorrect.',
  EMAIL_EXISTS: 'An account with this email already exists.',
  EMAIL_NOT_FOUND: 'No account found for this email address.',
  WEAK_PASSWORD: 'Password does not meet security requirements.',
  EXPIRED_TOKEN: 'This link has expired. Please request a new one.',
  NETWORK_TIMEOUT: 'Network timeout. Please try again.',
};

export const mapErrorCode = (code, fallback = 'Something went wrong. Please try again.') => {
  if (!code) {
    return fallback;
  }

  return ERROR_MAP[code] ?? fallback;
};
