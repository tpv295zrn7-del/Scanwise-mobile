import React from 'react';

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

/* istanbul ignore next */
export const ComparisonScreenView = ({ route }) => {
  const { Text, View } = require('react-native');
  const original = route?.params?.original || {};
  const alternative = route?.params?.alternative || {};
  const model = ComparisonScreen({ original, alternative });

  return React.createElement(
    View,
    { style: { flex: 1, padding: 16, gap: 8 } },
    React.createElement(Text, null, model.title),
    React.createElement(Text, null, `Original: ${model.original.name || 'N/A'}`),
    React.createElement(
      Text,
      null,
      `Alternative: ${model.alternative.name || 'N/A'}`
    ),
    React.createElement(
      Text,
      null,
      `Calories Δ: ${model.summary.caloriesDelta || 0}`
    )
  );
};
