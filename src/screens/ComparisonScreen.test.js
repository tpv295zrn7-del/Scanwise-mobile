import { ComparisonScreen } from './ComparisonScreen';

test('ComparisonScreen computes nutrition deltas', () => {
  const screen = ComparisonScreen({
    original: { nutrition: { calories: 200, sugar: 20, sodium: 300, protein: 5 } },
    alternative: { nutrition: { calories: 150, sugar: 10, sodium: 250, protein: 8 } }
  });

  expect(screen.summary).toEqual({
    caloriesDelta: -50,
    sugarDelta: -10,
    sodiumDelta: -50,
    proteinDelta: 3
  });
});

test('ComparisonScreen handles missing nutrition values', () => {
  const screen = ComparisonScreen({ original: {}, alternative: {} });
  expect(screen.summary).toEqual({
    caloriesDelta: 0,
    sugarDelta: 0,
    sodiumDelta: 0,
    proteinDelta: 0
  });
});

test('ComparisonScreen handles null product objects', () => {
  const screen = ComparisonScreen({ original: null, alternative: null });
  expect(screen.original.nutrition).toEqual({});
  expect(screen.alternative.nutrition).toEqual({});
});
