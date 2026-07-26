export const HomeScreen = ({ user, recentScans = [], familyMembers = [], navigation }) => ({
  greeting: `Welcome, ${user?.name || 'Guest'}!`,
  scanButton: 'Scan Product',
  recentScans,
  familyMembers,
  onScanPress: () => navigation.navigate('Scan', { mode: 'barcode' }),
  onSavedPress: () => navigation.navigate('Saved'),
  onProfilePress: () => navigation.navigate('Profile'),
});
