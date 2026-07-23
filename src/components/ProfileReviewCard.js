import React from 'react';
import { Pressable, Text, View } from 'react-native';

const ProfileReviewCard = ({ title, items, onEdit }) => (
  <View accessibilityRole="summary" style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 10 }}>
    <Text>{title}</Text>
    {items.length === 0 ? <Text>None</Text> : items.map((item) => <Text key={item}>{item}</Text>)}
    <Pressable onPress={onEdit}>
      <Text>Edit</Text>
    </Pressable>
  </View>
);

export default ProfileReviewCard;
