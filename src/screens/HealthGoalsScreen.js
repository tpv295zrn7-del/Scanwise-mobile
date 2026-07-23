import { updateHealthProfile } from '../redux/slices/healthProfilesSlice';

const GOALS = ['sugar', 'protein', 'sodium', 'budget', 'fiber'];

export const HealthGoalsScreen = ({ dispatch }) => {
  const selected = [];
  return {
    goals: GOALS,
    toggle: (goal) => {
      if (!GOALS.includes(goal)) return selected;
      if (selected.includes(goal))
        return (selected.splice(selected.indexOf(goal), 1), selected);
      if (selected.length < 5) selected.push(goal);
      return selected;
    },
    save: () => {
      if (!selected.length) return 'Select at least one goal';
      dispatch(updateHealthProfile({ goals: selected }));
      return 'saved';
    }
  };
};
