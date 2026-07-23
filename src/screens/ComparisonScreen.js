const getNutrition = (product = {}) => product?.nutrition || {};

export const ComparisonScreen = ({ original = {}, alternative = {} } = {}) => ({
  title: 'Product Comparison',
  original: {
    name: original?.name,
    brand: original?.brand,
    nutrition: getNutrition(original)
  },
  alternative: {
    name: alternative?.name,
    brand: alternative?.brand,
    nutrition: getNutrition(alternative)
  },
  summary: {
    caloriesDelta:
      (getNutrition(alternative).calories || 0) -
      (getNutrition(original).calories || 0),
    sugarDelta:
      (getNutrition(alternative).sugar || 0) - (getNutrition(original).sugar || 0),
    sodiumDelta:
      (getNutrition(alternative).sodium || 0) -
      (getNutrition(original).sodium || 0),
    proteinDelta:
      (getNutrition(alternative).protein || 0) -
      (getNutrition(original).protein || 0)
  }
});
