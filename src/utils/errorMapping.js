export const ERROR_MAP = {
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_LOCKED: 'Account temporarily locked. Please try again later.',
  NETWORK_ERROR: 'Please check your internet connection and retry.',
  SERVER_ERROR: 'Something went wrong. Please try again.'
};

export const mapBackendError = (code) =>
  ERROR_MAP[code] || 'Unexpected error occurred.';
