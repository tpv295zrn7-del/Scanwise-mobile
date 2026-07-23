const icons = {
  sugar: require('../assets/icon-sugar.png'),
  sodium: require('../assets/icon-sodium.png'),
  fiber: require('../assets/icon-fiber.png'),
  protein: require('../assets/icon-protein.png'),
  budget: require('../assets/icon-budget.png'),
  calories: require('../assets/icon-calories.png')
};

export const GoalIcon = ({ goal, size = 24 }) => ({
  type: 'GoalIcon',
  props: { goal, source: icons[goal], size }
});
