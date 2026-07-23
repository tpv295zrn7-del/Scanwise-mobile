import { SignupScreen } from './SignupScreen';

test('strength and submit', () => {
  const dispatch = jest.fn();
  const navigation = { navigate: jest.fn() };
  const screen = SignupScreen({ dispatch, navigation });
  expect(screen.strength('a')).toBe('weak');
  expect(screen.submit('bad', 'weak', 'weak', false)).toBe('Validation failed');
  expect(screen.submit('a@b.com', 'Aa!23456', 'Aa!23456', true)).toBe(
    'submitted'
  );
});
