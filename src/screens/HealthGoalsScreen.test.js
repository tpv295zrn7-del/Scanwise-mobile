import { HealthGoalsScreen } from './HealthGoalsScreen';

test('goal toggle and limits', () => {
  const dispatch = jest.fn();
  const screen = HealthGoalsScreen({ dispatch });
  expect(screen.goals).toContain('sugar');
  ['sugar', 'protein', 'sodium', 'budget', 'fiber', 'other'].forEach((g) =>
    screen.toggle(g)
  );
  expect(screen.toggle('fiber').length).toBeLessThanOrEqual(5);
  expect(screen.save()).toBe('saved');
});
