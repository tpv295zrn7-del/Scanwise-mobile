import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';

const AppRoot = () => (
  <Provider store={store}>
    <View style={styles.container}>
      <Text>ScanWise</Text>
    </View>
  </Provider>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});

// Default export for Expo 49 AppEntry.js (`import App from '../../App'`).
// Named export satisfies any bundler variant that uses `import { App } from '../../App'`.
export { AppRoot as App };
export default AppRoot;
