import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import FormInput from '@/components/FormInput';
import FormButton from '@/components/FormButton';
import { signupUser, selectAuthLoading, selectAuthError } from '@/redux/slices/authSlice';
import { passwordStrength } from '@/services/auth';
import { validateSignupForm } from '@/utils/validation';

const SignupScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const apiError = useSelector(selectAuthError);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState({});

  const strength = passwordStrength(password);

  const onSubmit = async () => {
    const formErrors = validateSignupForm({ email, password, confirmPassword, acceptedTerms });
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      return;
    }

    const result = await dispatch(signupUser({ email, password, name }));
    if (signupUser.fulfilled.match(result)) {
      navigation.navigate('OnboardingWelcomeScreen');
    }
  };

  return (
    <View>
      <Text>Sign up</Text>
      <FormInput label="Name" placeholder="Name" value={name} onChangeText={setName} />
      <FormInput label="Email" placeholder="you@email.com" value={email} onChangeText={setEmail} error={errors.email} keyboardType="email-address" />
      <FormInput label="Password" placeholder="Password" value={password} onChangeText={setPassword} error={errors.password} secureTextEntry />
      <Text>{`Password strength: ${strength}`}</Text>
      <FormInput label="Confirm Password" placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} error={errors.confirmPassword} secureTextEntry />
      <Pressable onPress={() => setAcceptedTerms((prev) => !prev)}><Text>{acceptedTerms ? '☑' : '☐'} Accept Terms</Text></Pressable>
      {errors.acceptedTerms ? <Text>{errors.acceptedTerms}</Text> : null}
      {apiError ? <Text>{apiError}</Text> : null}
      <FormButton title="Create Account" onPress={onSubmit} loading={loading} />
    </View>
  );
};

export default SignupScreen;
