import { OnboardingWelcomeScreen } from './OnboardingWelcomeScreen';

test('hero and navigation actions', () => {
  const dispatch = jest.fn();
  const navigation = { navigate: jest.fn() };
  const screen = OnboardingWelcomeScreen({ dispatch, navigation });
  expect(screen.hero).toBeTruthy();
  screen.continue();
  screen.skip();
  expect(navigation.navigate).toHaveBeenCalledWith('HealthGoals');
  expect(navigation.navigate).toHaveBeenCalledWith('Home');
});
