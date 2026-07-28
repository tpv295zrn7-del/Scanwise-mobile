import { updateHealthProfile } from '../redux/slices/healthProfilesSlice';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

const GOALS = ['sugar', 'protein', 'sodium', 'budget', 'fiber'];
const MAX_GOAL_SELECTIONS = 5;

export const toggleGoalSelection = (selectedGoals, goal) => {
  if (!GOALS.includes(goal)) return selectedGoals;
  if (selectedGoals.includes(goal))
    return selectedGoals.filter((item) => item !== goal);
  if (selectedGoals.length >= MAX_GOAL_SELECTIONS) return selectedGoals;
  return [...selectedGoals, goal];
};

export const HealthGoalsScreen = ({ dispatch, initialSelected = [] }) => {
  const selected = [...initialSelected];
  return {
    goals: GOALS,
    toggle: (goal) => {
      const nextSelected = toggleGoalSelection(selected, goal);
      selected.splice(0, selected.length, ...nextSelected);
      return selected;
    },
    save: () => {
      if (!selected.length) return 'Select at least one goal';
      dispatch(updateHealthProfile({ goals: selected }));
      return 'saved';
    }
  };
};

/* istanbul ignore next */
export const HealthGoalsScreenView = () => {
  const { Button, Text, View } = require('react-native');
  const dispatch = useDispatch();
  const model = HealthGoalsScreen({ dispatch, initialSelected: [] });
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState('');

  return React.createElement(
    View,
    { style: { flex: 1, padding: 16, gap: 8 } },
    React.createElement(Text, null, 'Select health goals'),
    ...model.goals.map((goal) =>
      React.createElement(Button, {
        key: goal,
        title: selected.includes(goal) ? `✓ ${goal}` : goal,
        onPress: () => setSelected([...model.toggle(goal)])
      })
    ),
    message ? React.createElement(Text, null, message) : null,
    React.createElement(Button, {
      title: 'Save Goals',
      onPress: () => setMessage(model.save())
    })
  );
};
