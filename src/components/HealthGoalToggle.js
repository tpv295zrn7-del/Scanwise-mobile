import { GoalIcon } from './GoalIcon';

export const HealthGoalToggle = ({ goal, selected, onToggle }) => ({
  type: 'HealthGoalToggle',
  props: { goal, selected, onToggle, icon: GoalIcon({ goal }) }
});
