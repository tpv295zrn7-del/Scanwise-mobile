import React from 'react';

export const SavedItemsScreen = ({
  items = [],
  onRemove,
  onRescan,
  onLongPressRemove
} = {}) => ({
  emptyIllustration: require('../assets/empty-saved.png'),
  items: items.map((item) => ({
    id: item.id,
    image: item.image || require('../assets/icon-scan.png'),
    name: item.name,
    brand: item.brand,
    lastScannedDate: item.lastScannedDate || null,
    confidence: item.confidence || 'estimated'
  })),
  empty: items.length === 0,
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
});

/* istanbul ignore next */
export const SavedItemsScreenView = () => {
  const { FlatList, Text, TouchableOpacity, View } = require('react-native');
  const model = SavedItemsScreen({ items: [] });

  if (model.empty) {
    return React.createElement(
      View,
      { style: { flex: 1, padding: 16 } },
      React.createElement(Text, null, model.emptyStateText)
    );
  }

  return React.createElement(
    FlatList,
    {
      data: model.items,
      keyExtractor: (item) => `${item.id}`,
      renderItem: ({ item }) =>
        React.createElement(
          TouchableOpacity,
          { onPress: () => model.rescanItem(item.id), style: { padding: 12 } },
          React.createElement(Text, null, item.name || 'Unnamed item')
        )
    }
  );
};
