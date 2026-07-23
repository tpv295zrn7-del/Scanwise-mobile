import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import FormInput from '@/components/FormInput';
import FormButton from '@/components/FormButton';
import { requestPasswordReset, selectAuthLoading, selectAuthError } from '@/redux/slices/authSlice';
import { validateEmail } from '@/services/auth';

const ForgotPasswordScreen = () => {
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const apiError = useSelector(selectAuthError);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email.');
      return;
    }

    setError('');
    const result = await dispatch(requestPasswordReset({ email }));
    if (requestPasswordReset.fulfilled.match(result)) {
      setMessage('Check your email');
    }
  };

  return (
    <View>
      <Text>Forgot Password</Text>
      <FormInput label="Email" placeholder="you@email.com" value={email} onChangeText={setEmail} error={error} keyboardType="email-address" />
      {message ? <Text>{message}</Text> : null}
      {apiError ? <Text>{apiError}</Text> : null}
      <FormButton title="Send Reset Link" onPress={onSubmit} loading={loading} />
    </View>
  );
};

export default ForgotPasswordScreen;
