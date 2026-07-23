import React from 'react';
import { Text, TextInput, View } from 'react-native';

const FormInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  nativeID,
  maxLength,
  showCounter = false,
}) => (
  <View style={{ marginBottom: 12 }}>
    <Text accessibilityLabel={label}>{label}</Text>
    <TextInput
      nativeID={nativeID ?? label}
      accessibilityLabel={label}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      maxLength={maxLength}
      style={{
        borderWidth: 1,
        borderColor: error ? '#f00' : '#888',
        borderRadius: 6,
        padding: 10,
      }}
    />
    {showCounter ? <Text>{`${value.length}/${maxLength ?? 0}`}</Text> : null}
    {error ? <Text accessibilityRole="alert" style={{ color: '#f00' }}>{error}</Text> : null}
  </View>
);

export default FormInput;
