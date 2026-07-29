import { selectSavedItems } from '../redux/slices/savedItemsSlice';

export const SavedItemsScreen = ({
  state,
  items = [],
  onRemove,
  onRescan,
  onLongPressRemove,
  onViewItem
} = {}) => {
  const savedItems = state ? selectSavedItems(state) : items;

  return {
  emptyIllustration: require('../assets/empty-saved.png'),
  items: savedItems.map((item) => ({
    id: item.id,
    barcode: item.barcode || item.id,
    image: item.image || null,
    name: item.name,
    brand: item.brand,
    nutriscore: item.nutriscore || null,
    category: item.category || '',
    lastScannedDate: item.lastScannedDate || null,
    confidence: item.confidence || 'estimated'
  })),
  empty: savedItems.length === 0,
  emptyStateText: 'Scan your first product to get started!',
  removeButtonLabel: 'Remove',
  rescanButtonLabel: 'Re-scan',
  viewItem: (id) => {
    const item = savedItems.find((it) => (it.id || it.barcode) === id);
    if (onViewItem) onViewItem(item);
    return item || null;
  },
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
