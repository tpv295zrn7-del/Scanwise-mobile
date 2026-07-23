import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import AllergenItem from '@/components/AllergenItem';
import FormButton from '@/components/FormButton';
import { setAllergies } from '@/redux/slices/healthProfilesSlice';
import { markStepComplete, setCurrentStep } from '@/redux/slices/onboardingSlice';

const ALLERGENS = ['dairy', 'gluten', 'nuts', 'shellfish', 'soy', 'sesame', 'eggs', 'other'];

const AllergySetupScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState([]);

  const toggleAllergen = (name) => {
    setSelected((prev) => {
      if (prev.find((item) => item.name === name)) {
        return prev.filter((item) => item.name !== name);
      }
      return [...prev, { name, severity: 'mild' }];
    });
  };

  const updateSeverity = (name, severity) => {
    setSelected((prev) => prev.map((item) => (item.name === name ? { ...item, severity } : item)));
  };

  const remove = (name) => setSelected((prev) => prev.filter((item) => item.name !== name));

  const proceed = () => {
    dispatch(setAllergies(selected));
    dispatch(markStepComplete(3));
    dispatch(setCurrentStep(3));
    navigation.navigate('FamilyProfilesScreen');
  };

  return (
    <View>
      <Text>Allergy Setup</Text>
      {ALLERGENS.map((name) => (
        <FormButton key={name} title={selected.find((item) => item.name === name) ? `Remove ${name}` : `Add ${name}`} onPress={() => toggleAllergen(name)} variant="secondary" />
      ))}
      {selected.map((item) => (
        <AllergenItem key={item.name} allergen={item} onChangeSeverity={updateSeverity} onRemove={remove} />
      ))}
      <FormButton title="Continue" onPress={proceed} />
      <FormButton title="Skip" onPress={proceed} variant="secondary" />
    </View>
  );
};

export default AllergySetupScreen;
