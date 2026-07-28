import { setAllergenSeverity } from '../redux/slices/healthProfilesSlice';
import React from 'react';
import { useDispatch } from 'react-redux';

export const AllergySetupScreen = ({ dispatch }) => ({
  setSeverity: (name, severity) =>
    dispatch(setAllergenSeverity({ name, severity }))
});

/* istanbul ignore next */
export const AllergySetupScreenView = () => {
  const { Button, Text, View } = require('react-native');
  const dispatch = useDispatch();
  const model = AllergySetupScreen({ dispatch });

  return React.createElement(
    View,
    { style: { flex: 1, padding: 16, gap: 12 } },
    React.createElement(Text, null, 'Allergy setup'),
    React.createElement(Button, {
      title: 'Set nuts: high',
      onPress: () => model.setSeverity('nuts', 'high')
    })
  );
};
