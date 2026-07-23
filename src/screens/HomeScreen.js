export const HomeScreen = ({ user, recentScans = [], familyMembers = [] }) => ({
  greeting: `Welcome, ${user?.name || 'Guest'}!`,
  scanButton: 'Scan Product',
  recentScans,
  familyMembers
});
