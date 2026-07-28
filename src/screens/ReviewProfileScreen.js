import { updateHealthProfile } from '../redux/slices/healthProfilesSlice';
import React from 'react';
import { useDispatch } from 'react-redux';

export const ReviewProfileScreen = ({ dispatch, profile }) => ({
  complete: () => dispatch(updateHealthProfile(profile))
});

/* istanbul ignore next */
export const ReviewProfileScreenView = ({ navigation }) => {
  const { Button, Text, View } = require('react-native');
  const dispatch = useDispatch();
  const profile = { completedAt: Date.now() };
  const model = ReviewProfileScreen({ dispatch, profile });

  return React.createElement(
    View,
    { style: { flex: 1, padding: 16, gap: 12 } },
    React.createElement(Text, null, 'Review profile'),
    React.createElement(Button, {
      title: 'Complete',
      onPress: () => {
        model.complete();
        navigation.navigate('Home');
      }
    })
  );
};
