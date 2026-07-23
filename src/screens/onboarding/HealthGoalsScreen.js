import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import HealthGoalToggle from '@/components/HealthGoalToggle';
import FormButton from '@/components/FormButton';
import { HEALTH_GOALS } from '@/utils/constants';
import { updateGoals, markStepComplete, setCurrentStep } from '@/redux/slices/onboardingSlice';

const HealthGoalsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [error, setError] = useState('');

  const onToggle = (goalKey) => {
    setSelectedGoals((prev) => {
      if (prev.includes(goalKey)) {
        return prev.filter((goal) => goal !== goalKey);
      }

      setError('');
      return [...prev, goalKey];
    });
  };

  const onContinue = () => {
    if (selectedGoals.length < 1) {
      setError('Select at least one goal.');
      return;
    }

    dispatch(updateGoals(selectedGoals));
    dispatch(markStepComplete(2));
    dispatch(setCurrentStep(2));
    navigation.navigate('AllergySetupScreen');
  };

  return (
    <View>
      <Text>Select your health goals</Text>
      {HEALTH_GOALS.map((goal) => (
        <HealthGoalToggle key={goal.key} goal={goal} selected={selectedGoals.includes(goal.key)} onToggle={onToggle} />
      ))}
      {error ? <Text>{error}</Text> : null}
      <FormButton title="Continue" onPress={onContinue} />
    </View>
  );
};

export default HealthGoalsScreen;
