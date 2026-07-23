import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import FormInput from '@/components/FormInput';
import FormButton from '@/components/FormButton';
import { confirmPasswordReset, selectAuthLoading, selectAuthError } from '@/redux/slices/authSlice';
import { passwordStrength } from '@/services/auth';

const PasswordResetScreen = ({ route, navigation }) => {
  const token = route?.params?.token ?? '';
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const apiError = useSelector(selectAuthError);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async () => {
    if (password !== confirmPassword) {
      setError('Passwords must match.');
      return;
    }

    setError('');
    const result = await dispatch(confirmPasswordReset({ token, password }));

    if (confirmPasswordReset.fulfilled.match(result)) {
      navigation.navigate('LoginScreen');
    }
  };

  return (
    <View>
      <Text>Password Reset</Text>
      <Text>{`Strength: ${passwordStrength(password)}`}</Text>
      <FormInput label="New Password" value={password} onChangeText={setPassword} error={error} secureTextEntry />
      <FormInput label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
      {apiError ? <Text>{apiError}</Text> : null}
      <FormButton title="Reset Password" onPress={onSubmit} loading={loading} />
    </View>
  );
};

export default PasswordResetScreen;
