// API configuration — single source of truth for the backend host.
//
// To point the app at a different backend (e.g. a deployed staging or
// production server), update API_BASE_URL below. All HTTP traffic
// flows through this constant.
//
// Examples:
//   - Local dev sandbox: 'http://localhost:3001' (only reachable from
//     the same machine; won't work for an iPhone on Wi-Fi)
//   - Deployed Render:  'https://scanwise-api.onrender.com'
//   - Production:       'https://api.scanwise.app'
export const API_BASE_URL = 'https://scanwise-api-q1uz.onrender.com';

export const API_TIMEOUT = 10000;  // 10s per request
export const RETRY_COUNT = 3;      // exponential backoff retries

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
  savedItems: '/api/saved-items',
  corrections: '/api/corrections',
  health: '/api/health',
  stats: '/api/stats',
};

export const COLORS = {
  primary: '#10B981',
  secondary: '#6366F1',
  verifiedBg: '#D1FAE5',
  verifiedText: '#065F46',
  estimatedBg: '#FEF3C7',
  estimatedText: '#92400E',
  incompleteBg: '#FEE2E2',
  incompleteText: '#991B1B',
};
