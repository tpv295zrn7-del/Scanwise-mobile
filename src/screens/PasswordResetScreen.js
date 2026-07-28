import { confirmPasswordReset } from '../redux/slices/authSlice';
import { validatePassword } from '../services/auth';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

export const PasswordResetScreen = ({ dispatch, navigation, token }) => ({
  submit: (password) => {
    if (!validatePassword(password)) return 'Validation failed';
    dispatch(confirmPasswordReset({ token, password }));
    navigation.navigate('Login');
    return 'reset';
  }
});

/* istanbul ignore next */
export const PasswordResetScreenView = ({ navigation, route }) => {
  const { Button, Text, TextInput, View } = require('react-native');
  const dispatch = useDispatch();
  const token = route?.params?.token || '';
  const model = PasswordResetScreen({ dispatch, navigation, token });
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  return React.createElement(
    View,
    { style: { flex: 1, padding: 16, gap: 12 } },
    React.createElement(Text, null, 'Reset Password'),
    React.createElement(TextInput, {
      value: password,
      onChangeText: setPassword,
      placeholder: 'New Password',
      secureTextEntry: true
    }),
    message ? React.createElement(Text, null, message) : null,
    React.createElement(Button, {
      title: 'Reset Password',
      onPress: () => setMessage(model.submit(password))
    })
  );
};
