import React from 'react';
import { Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import FormButton from '@/components/FormButton';
import { markStepComplete, setCurrentStep } from '@/redux/slices/onboardingSlice';

const OnboardingWelcomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const onContinue = () => {
    dispatch(markStepComplete(1));
    dispatch(setCurrentStep(1));
    navigation.navigate('HealthGoalsScreen');
  };

  return (
    <View>
      <Text>Welcome to ScanWise</Text>
      <Text>Set up your profile to receive personalized scan recommendations.</Text>
      <FormButton title="Continue" onPress={onContinue} />
      <FormButton title="Skip for Now" onPress={() => navigation.navigate('HomeScreen')} variant="secondary" />
    </View>
  );
};

export default OnboardingWelcomeScreen;
