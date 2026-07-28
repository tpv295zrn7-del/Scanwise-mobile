import React from 'react';

export const HomeScreen = ({ user, recentScans = [], familyMembers = [] }) => ({
  greeting: `Welcome, ${user?.name || 'Guest'}!`,
  scanButton: 'Scan Product',
  recentScans,
  familyMembers
});

/* istanbul ignore next */
export const HomeScreenView = ({ navigation }) => {
  const { Button, Text, View } = require('react-native');
  const model = HomeScreen({});

  return React.createElement(
    View,
    { style: { flex: 1, padding: 16, gap: 12 } },
    React.createElement(Text, null, model.greeting),
    React.createElement(Button, {
      title: model.scanButton,
      onPress: () => navigation.navigate('Scan')
    })
  );
};
