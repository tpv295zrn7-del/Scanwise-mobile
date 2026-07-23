import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import FormInput from '@/components/FormInput';
import FormButton from '@/components/FormButton';
import { loginUser, selectAuthError, selectAuthLoading, selectLoginAttempts, selectIsLockedOut } from '@/redux/slices/authSlice';
import { validateLoginForm } from '@/utils/validation';

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const apiError = useSelector(selectAuthError);
  const loginAttempts = useSelector(selectLoginAttempts);
  const lockedOut = useSelector(selectIsLockedOut);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const onSubmit = async () => {
    const formErrors = validateLoginForm({ email, password });
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0 || lockedOut) {
      return;
    }

    const result = await dispatch(loginUser({ email, password }));

    if (loginUser.fulfilled.match(result)) {
      navigation.navigate('HomeScreen');
    }
  };

  return (
    <View>
      <Text>Login</Text>
      <FormInput label="Email" placeholder="you@email.com" value={email} onChangeText={setEmail} error={errors.email} keyboardType="email-address" />
      <FormInput label="Password" placeholder="Password" value={password} onChangeText={setPassword} error={errors.password} secureTextEntry />
      {apiError ? <Text>{apiError}</Text> : null}
      {lockedOut ? <Text>Account locked after 5/5 attempts.</Text> : <Text>{`${loginAttempts}/5 attempts`}</Text>}
      <FormButton title="Sign In" onPress={onSubmit} loading={loading} />
      <Pressable onPress={() => navigation.navigate('SignupScreen')}><Text>Create account</Text></Pressable>
      <Pressable onPress={() => navigation.navigate('ForgotPasswordScreen')}><Text>Forgot password</Text></Pressable>
    </View>
  );
};

export default LoginScreen;
