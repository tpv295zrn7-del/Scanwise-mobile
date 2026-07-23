import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

const getBackground = (variant, disabled) => {
  if (disabled) {
    return '#b0b0b0';
  }

  return variant === 'secondary' ? '#0b7285' : '#2b8a3e';
};

const FormButton = ({ title, onPress, loading = false, disabled = false, variant = 'primary' }) => (
  <Pressable
    accessibilityRole="button"
    accessibilityState={{ disabled: disabled || loading, busy: loading }}
    onPress={onPress}
    disabled={disabled || loading}
    style={{ backgroundColor: getBackground(variant, disabled || loading), padding: 12, borderRadius: 6 }}
  >
    {loading ? (
      <ActivityIndicator accessibilityLabel={`${title} loading`} color="#fff" testID="button-loader" />
    ) : (
      <Text style={{ color: '#fff', textAlign: 'center' }}>{title}</Text>
    )}
  </Pressable>
);

export default FormButton;
