import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import FormButton from '@/components/FormButton';
import FormInput from '@/components/FormInput';
import FamilyMemberCard from '@/components/FamilyMemberCard';
import { addFamilyMember, removeFamilyMember, selectFamilyMembers } from '@/redux/slices/healthProfilesSlice';
import { markStepComplete, setCurrentStep } from '@/redux/slices/onboardingSlice';
import { MAX_FAMILY_MEMBERS } from '@/utils/constants';

const FamilyProfilesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const members = useSelector(selectFamilyMembers);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('other');

  const addMember = () => {
    if (!name || members.length >= MAX_FAMILY_MEMBERS) {
      return;
    }

    dispatch(
      addFamilyMember({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        relationship,
        allergies: [],
        dietaryPreferences: [],
      })
    );
    setName('');
  };

  const proceed = () => {
    dispatch(markStepComplete(4));
    dispatch(setCurrentStep(4));
    navigation.navigate('ReviewProfileScreen');
  };

  return (
    <View>
      <Text>Family Profiles</Text>
      <FormInput label="Member Name" value={name} onChangeText={setName} />
      <FormInput label="Relationship" value={relationship} onChangeText={setRelationship} />
      <FormButton title="Add Member" onPress={addMember} />
      {members.map((member) => (
        <FamilyMemberCard key={member.id} member={member} onEdit={() => {}} onDelete={(id) => dispatch(removeFamilyMember(id))} />
      ))}
      <FormButton title="Continue" onPress={proceed} />
    </View>
  );
};

export default FamilyProfilesScreen;
