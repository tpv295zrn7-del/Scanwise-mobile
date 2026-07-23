import { HomeScreen } from './HomeScreen';

test('greeting and scan button', () => {
  const screen = HomeScreen({
    user: { name: 'Alex' },
    recentScans: [],
    familyMembers: []
  });
  expect(screen.greeting).toContain('Alex');
  expect(screen.scanButton).toBe('Scan Product');
  expect(HomeScreen({}).greeting).toContain('Guest');
});
