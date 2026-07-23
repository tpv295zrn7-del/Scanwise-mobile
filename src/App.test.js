import { App } from './App';

test('app bootstraps route group', () => {
  const result = App();
  expect(result.store).toBeTruthy();
  expect(['AuthStack', 'OnboardingStack', 'AppStack']).toContain(
    result.routeGroup
  );
});
