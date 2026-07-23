import { updateHealthProfile } from '../redux/slices/healthProfilesSlice';

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
