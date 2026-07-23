import React from 'react';
import { Pressable, Text, View } from 'react-native';

const severityOptions = ['mild', 'moderate', 'severe'];

const AllergenItem = ({ allergen, onChangeSeverity, onRemove }) => (
  <View style={{ paddingVertical: 8 }}>
    <Text>{allergen.name}</Text>
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {severityOptions.map((level) => (
        <Pressable
          key={level}
          accessibilityRole="button"
          accessibilityLabel={`${allergen.name} ${level}`}
          onPress={() => onChangeSeverity(allergen.name, level)}
        >
          <Text style={{ color: allergen.severity === level ? '#2b8a3e' : '#222' }}>{level}</Text>
        </Pressable>
      ))}
    </View>
    <Pressable onPress={() => onRemove(allergen.name)} accessibilityRole="button">
      <Text>Remove</Text>
    </Pressable>
  </View>
);

export default AllergenItem;
