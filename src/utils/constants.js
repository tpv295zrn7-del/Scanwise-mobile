export const API_BASE_URL = 'https://api.scanwise.app';
export const API_TIMEOUT = 10000;
export const RETRY_COUNT = 3;

export const ENDPOINTS = {
  login: '/auth/login',
  signup: '/auth/signup',
  logout: '/auth/logout',
  refresh: '/auth/refresh',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  profile: '/profiles/me',
  scans: '/api/scans',
  alternatives: '/api/alternatives',
  corrections: '/api/corrections'
};

export const COLORS = {
  primary: '#10B981',
  secondary: '#6366F1',
  verifiedBg: '#D1FAE5',
  verifiedText: '#065F46',
  estimatedBg: '#FEF3C7',
  estimatedText: '#92400E',
  incompleteBg: '#FEE2E2',
  incompleteText: '#991B1B'
};
