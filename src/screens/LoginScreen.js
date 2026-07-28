import { loginUser } from '../redux/slices/authSlice';
import { validateEmail } from '../services/auth';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const LoginScreen = ({ dispatch, navigation, state }) => ({
  testID: 'login-screen',
  locked: state?.auth?.isLocked,
  submit: (email, password) => {
    if (!validateEmail(email) || !password) return 'Validation failed';
    dispatch(loginUser({ email, password }));
    return 'submitted';
  },
  goSignup: () => navigation.navigate('Signup'),
  goForgot: () => navigation.navigate('ForgotPassword')
});

/* istanbul ignore next */
export const LoginScreenView = ({ navigation }) => {
  const { Button, Text, TextInput, View } = require('react-native');
  const dispatch = useDispatch();
  const state = useSelector((rootState) => rootState);
  const model = LoginScreen({ dispatch, navigation, state });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  return React.createElement(
    View,
    { style: { flex: 1, padding: 16, gap: 12 } },
    React.createElement(Text, null, 'Login'),
    React.createElement(TextInput, {
      value: email,
      onChangeText: setEmail,
      placeholder: 'Email',
      autoCapitalize: 'none'
    }),
    React.createElement(TextInput, {
      value: password,
      onChangeText: setPassword,
      placeholder: 'Password',
      secureTextEntry: true
    }),
    message ? React.createElement(Text, null, message) : null,
    React.createElement(Button, {
      title: 'Sign In',
      onPress: () => setMessage(model.submit(email, password))
    }),
    React.createElement(Button, { title: 'Sign Up', onPress: model.goSignup }),
    React.createElement(Button, {
      title: 'Forgot Password',
      onPress: model.goForgot
    })
  );
};
