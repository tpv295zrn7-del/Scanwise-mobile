import { selectSavedItems } from '../redux/slices/savedItemsSlice';

export const SavedItemsScreen = ({
  state,
  items = [],
  onRemove,
  onRescan,
  onLongPressRemove
} = {}) => {
  const savedItems = state ? selectSavedItems(state) : items;

  return {
  emptyIllustration: require('../assets/empty-saved.png'),
  items: savedItems.map((item) => ({
    id: item.id,
    image: item.image || require('../assets/icon-scan.png'),
    name: item.name,
    brand: item.brand,
    lastScannedDate: item.lastScannedDate || null,
    confidence: item.confidence || 'estimated'
  })),
  empty: savedItems.length === 0,
  emptyStateText: 'No saved items yet',
  removeButtonLabel: 'Remove',
  rescanButtonLabel: 'Re-scan',
  removeItem: (id) => {
    if (onRemove) onRemove(id);
    if (onLongPressRemove) onLongPressRemove(id);
    return id;
  },
  rescanItem: (id) => {
    if (onRescan) onRescan(id);
    return id;
  }
  };
};
