import { addFamilyMember } from '../redux/slices/healthProfilesSlice';
import React from 'react';
import { useDispatch } from 'react-redux';

export const FamilyProfilesScreen = ({ dispatch }) => ({
  add: (member) => dispatch(addFamilyMember(member))
});

/* istanbul ignore next */
export const FamilyProfilesScreenView = () => {
  const { Button, Text, View } = require('react-native');
  const dispatch = useDispatch();
  const model = FamilyProfilesScreen({ dispatch });

  return React.createElement(
    View,
    { style: { flex: 1, padding: 16, gap: 12 } },
    React.createElement(Text, null, 'Family profiles'),
    React.createElement(Button, {
      title: 'Add sample member',
      onPress: () => model.add({ id: String(Date.now()), name: 'Family Member' })
    })
  );
};
