export const HomeScreen = ({ user, recentScans = [], familyMembers = [], navigation }) => ({
  greeting: `Welcome, ${user?.name || 'Guest'}!`,
  scanButton: 'Scan Product',
  recentScans,
  familyMembers,
  onScanPress: () => navigation.navigate('Scan', { mode: 'barcode' }),
});
