import { signupUser } from '../redux/slices/authSlice';
import {
  passwordStrength,
  validateEmail,
  validatePassword
} from '../services/auth';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

export const SignupScreen = ({ dispatch, navigation }) => ({
  testID: 'signup-screen',
  strength: (password) => passwordStrength(password),
  submit: (email, password, confirm, terms) => {
    if (
      !terms ||
      !validateEmail(email) ||
      !validatePassword(password) ||
      password !== confirm
    ) {
      return 'Validation failed';
    }
    dispatch(signupUser({ email, password }));
    navigation.navigate('Home');
    return 'submitted';
  }
});

/* istanbul ignore next */
export const SignupScreenView = ({ navigation }) => {
  const { Button, Text, TextInput, View } = require('react-native');
  const dispatch = useDispatch();
  const model = SignupScreen({ dispatch, navigation });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [message, setMessage] = useState('');

  return React.createElement(
    View,
    { style: { flex: 1, padding: 16, gap: 12 } },
    React.createElement(Text, null, 'Sign Up'),
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
    React.createElement(TextInput, {
      value: confirm,
      onChangeText: setConfirm,
      placeholder: 'Confirm Password',
      secureTextEntry: true
    }),
    React.createElement(Text, null, `Strength: ${model.strength(password)}`),
    React.createElement(Button, {
      title: acceptedTerms ? 'Terms Accepted' : 'Accept Terms',
      onPress: () => setAcceptedTerms((prev) => !prev)
    }),
    message ? React.createElement(Text, null, message) : null,
    React.createElement(Button, {
      title: 'Create Account',
      onPress: () =>
        setMessage(model.submit(email, password, confirm, acceptedTerms))
    })
  );
};
