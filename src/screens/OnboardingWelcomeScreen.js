import { markStepComplete } from '../redux/slices/onboardingSlice';
import React from 'react';
import { useDispatch } from 'react-redux';

export const OnboardingWelcomeScreen = ({ dispatch, navigation }) => ({
  hero: require('../assets/onboarding-hero.png'),
  continue: () => {
    dispatch(markStepComplete(0));
    navigation.navigate('HealthGoals');
  },
  skip: () => navigation.navigate('Home')
});

/* istanbul ignore next */
export const OnboardingWelcomeScreenView = ({ navigation }) => {
  const { Button, Text, View } = require('react-native');
  const dispatch = useDispatch();
  const model = OnboardingWelcomeScreen({ dispatch, navigation });

  return React.createElement(
    View,
    { style: { flex: 1, padding: 16, gap: 12 } },
    React.createElement(Text, null, 'Welcome to ScanWise'),
    React.createElement(Button, { title: 'Continue', onPress: model.continue }),
    React.createElement(Button, { title: 'Skip', onPress: model.skip })
  );
};
