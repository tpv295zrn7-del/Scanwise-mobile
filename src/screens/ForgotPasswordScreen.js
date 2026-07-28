import { requestPasswordReset } from '../redux/slices/authSlice';
import { validateEmail } from '../services/auth';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

export const ForgotPasswordScreen = ({ dispatch }) => ({
  submit: (email) => {
    if (!validateEmail(email)) return 'Validation failed';
    dispatch(requestPasswordReset(email));
    return 'sent';
  }
});

/* istanbul ignore next */
export const ForgotPasswordScreenView = () => {
  const { Button, Text, TextInput, View } = require('react-native');
  const dispatch = useDispatch();
  const model = ForgotPasswordScreen({ dispatch });
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  return React.createElement(
    View,
    { style: { flex: 1, padding: 16, gap: 12 } },
    React.createElement(Text, null, 'Forgot Password'),
    React.createElement(TextInput, {
      value: email,
      onChangeText: setEmail,
      placeholder: 'Email',
      autoCapitalize: 'none'
    }),
    message ? React.createElement(Text, null, message) : null,
    React.createElement(Button, {
      title: 'Send Reset Link',
      onPress: () => setMessage(model.submit(email))
    })
  );
};
