export const authSelectors = {
  user: (state) => state.auth.user,
  error: (state) => state.auth.error,
  loading: (state) => state.auth.loading,
  isAuthenticated: (state) => state.auth.isAuthenticated,
};
