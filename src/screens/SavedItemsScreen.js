export const SavedItemsScreen = ({ items = [] } = {}) => ({
  emptyIllustration: require('../assets/empty-saved.png'),
  items,
  empty: items.length === 0
});
