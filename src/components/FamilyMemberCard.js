import React from 'react';
import { Pressable, Text, View } from 'react-native';

const FamilyMemberCard = ({ member, onEdit, onDelete }) => (
  <View accessibilityRole="button" style={{ borderWidth: 1, borderColor: '#ddd', padding: 10, marginBottom: 8 }}>
    <Text>{member.name}</Text>
    <Text>{member.relationship}</Text>
    <Text>{`Allergens: ${member.allergies?.length ?? 0}`}</Text>
    <Pressable onPress={() => onEdit(member.id)}>
      <Text>Edit</Text>
    </Pressable>
    <Pressable onPress={() => onDelete(member.id)}>
      <Text>Delete</Text>
    </Pressable>
  </View>
);

export default FamilyMemberCard;
