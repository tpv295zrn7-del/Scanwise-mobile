import React from 'react';
import { Provider } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';
import { store } from './redux/store';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  },
});

const AppContent = () => (
  <View style={styles.container}>
    <Text style={styles.title}>ScanWise</Text>
    <Text style={styles.subtitle}>Mobile Scanning App</Text>
  </View>
);

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
