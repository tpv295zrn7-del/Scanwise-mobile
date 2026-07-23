import React from 'react';
import { Pressable, Text } from 'react-native';

const HealthGoalToggle = ({ goal, selected, onToggle }) => (
  <Pressable
    accessibilityRole="button"
    accessibilityState={{ selected }}
    onPress={() => onToggle(goal.key)}
    style={{
      minHeight: 48,
      justifyContent: 'center',
      padding: 12,
      borderWidth: 1,
      borderColor: selected ? '#2b8a3e' : '#999',
      marginBottom: 8,
    }}
  >
    <Text>{goal.label}</Text>
    {selected ? <Text accessibilityLabel={`${goal.label} selected`}>✓</Text> : null}
  </Pressable>
);

export default HealthGoalToggle;
