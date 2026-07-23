import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { onboardingApi } from '@/services/api';
import FormButton from '@/components/FormButton';
import ProfileReviewCard from '@/components/ProfileReviewCard';
import { selectFamilyMembers, selectAllergies } from '@/redux/slices/healthProfilesSlice';
import { markStepComplete } from '@/redux/slices/onboardingSlice';

const ReviewProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const familyMembers = useSelector(selectFamilyMembers);
  const allergies = useSelector(selectAllergies);
  const goals = useSelector((state) => state.onboarding.goals);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const completeSetup = async () => {
    setLoading(true);
    setError('');
    try {
      await onboardingApi.save({ goals, allergies, familyMembers });
      await onboardingApi.complete();
      dispatch(markStepComplete(5));
      navigation.navigate('HomeScreen');
    } catch (_e) {
      setError('Could not complete setup. Retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text>Review Profile</Text>
      <ProfileReviewCard title="Goals" items={goals} onEdit={() => navigation.navigate('HealthGoalsScreen')} />
      <ProfileReviewCard title="Allergies" items={allergies.map((item) => `${item.name} (${item.severity})`)} onEdit={() => navigation.navigate('AllergySetupScreen')} />
      <ProfileReviewCard title="Family" items={familyMembers.map((member) => member.name)} onEdit={() => navigation.navigate('FamilyProfilesScreen')} />
      {error ? <Text>{error}</Text> : null}
      <FormButton title="Complete Setup" onPress={completeSetup} loading={loading} />
    </View>
  );
};

export default ReviewProfileScreen;
