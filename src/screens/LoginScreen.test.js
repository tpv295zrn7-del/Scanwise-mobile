import { LoginScreen } from './LoginScreen';

test('validation and navigation', () => {
  const dispatch = jest.fn();
  const navigation = { navigate: jest.fn() };
  const screen = LoginScreen({
    dispatch,
    navigation,
    state: { auth: { isLocked: true } }
  });
  expect(screen.locked).toBe(true);
  expect(screen.submit('bad', '')).toBe('Validation failed');
  expect(screen.submit('a@b.com', 'Aa!23456')).toBe('submitted');
  screen.goSignup();
  screen.goForgot();
  expect(navigation.navigate).toHaveBeenCalledWith('Signup');
  expect(navigation.navigate).toHaveBeenCalledWith('ForgotPassword');
});
